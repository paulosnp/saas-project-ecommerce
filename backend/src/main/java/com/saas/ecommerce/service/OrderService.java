package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.order.CreateOrderRequest;
import com.saas.ecommerce.dto.order.OrderItemRequest;
import com.saas.ecommerce.dto.order.OrderResponse;
import com.saas.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.entity.OrderItem;
import com.saas.ecommerce.entity.Product;
import com.saas.ecommerce.enums.OrderStatus;
import com.saas.ecommerce.exception.InsufficientStockException;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.OrderMapper;
import com.saas.ecommerce.repository.OrderRepository;
import com.saas.ecommerce.repository.ProductRepository;
import com.saas.ecommerce.tenant.TenantAware;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@TenantAware
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, UUID customerId) {
        UUID storeId = TenantContext.requireCurrentTenant();
        if (storeId == null) {
            throw new IllegalStateException("Store ID not found in context");
        }

        Order order = Order.builder()
                .customerId(customerId)
                .storeId(storeId)
                .status(OrderStatus.PENDING)
                .shippingCost(request.shippingCost() != null ? request.shippingCost() : BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalItems = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findByIdAndStoreIdForUpdate(itemRequest.productId(), storeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", itemRequest.productId()));

            if (!product.getActive()) {
                throw new IllegalArgumentException("Produto indisponível: " + product.getName());
            }

            if (product.getStockQuantity() < itemRequest.quantity()) {
                throw new InsufficientStockException(product.getName(), product.getStockQuantity(),
                        itemRequest.quantity());
            }

            // Decrement stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.quantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice()) // Snapshot price at purchase time
                    .build();

            order.getItems().add(orderItem);
            totalItems = totalItems.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }

        order.setTotal(totalItems.add(order.getShippingCost()));
        order = orderRepository.save(order);

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> findAllByStore(Pageable pageable) {
        UUID storeId = TenantContext.requireCurrentTenant();
        return orderRepository.findAllByStoreId(storeId, pageable)
                .map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> findAllByCustomer(UUID customerId, Pageable pageable) {
        // Customer can see orders across all stores, or filtering by store could be
        // added if needed
        // For now, let's assume customer sees their orders globally or per store
        // context
        // Since @TenantAware filters by store_id, this query will implicitly filter by
        // current store context
        // If we want a global customer view, we'd need to bypass tenant filter, but for
        // storefront API it's per store.
        return orderRepository.findAllByCustomerId(customerId, pageable)
                .map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(UUID id) {
        UUID storeId = TenantContext.requireCurrentTenant();
        return orderRepository.findByIdAndStoreId(id, storeId)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", id));
    }

    @Transactional(readOnly = true)
    public OrderResponse findByIdAndCustomer(UUID id, UUID customerId) {
        // Find regardless of store for customer view, or enforce store?
        // Enforcing store context for security is safer in this architecture
        UUID storeId = TenantContext.requireCurrentTenant();
        Order order = orderRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", id));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Pedido", "id", id); // Obfuscate unauthorized access
        }

        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(UUID id, UpdateOrderStatusRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Order order = orderRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", id));

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.newStatus();

        validateStatusTransition(oldStatus, newStatus);

        if (newStatus == OrderStatus.SHIPPED) {
            if (request.trackingCode() == null || request.trackingCode().isBlank()) {
                throw new IllegalArgumentException("Código de rastreio é obrigatório para status SHIPPED");
            }
            order.setTrackingCode(request.trackingCode());
        }

        // Return stock if cancelled or refunded
        if ((newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.REFUNDED) &&
                (oldStatus != OrderStatus.CANCELLED && oldStatus != OrderStatus.REFUNDED)) {
            restoreStock(order);
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);
        return orderMapper.toResponse(order);
    }

    private void validateStatusTransition(OrderStatus oldStatus, OrderStatus newStatus) {
        if (oldStatus == newStatus)
            return;

        if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.REFUNDED) {
            throw new IllegalArgumentException("Não é possível alterar status de pedido cancelado/reembolsado");
        }

        // Add specific transition rules if needed, e.g. PENDING -> SHIPPED (skip
        // payment?)
        // For now allowing most transitions for admin flexibility, except reviving dead
        // orders
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }
}
