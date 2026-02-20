package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.customer.CustomerOrderResponse;
import com.saas.ecommerce.dto.customer.CustomerSummaryResponse;
import com.saas.ecommerce.dto.order.OrderItemResponse;
import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.repository.OrderRepository;
import com.saas.ecommerce.repository.UserRepository;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CustomerSummaryResponse> getCustomerSummaries() {
        UUID storeId = TenantContext.requireCurrentTenant();

        List<UUID> customerIds = orderRepository.findDistinctCustomerIdsByStoreId(storeId);

        return customerIds.stream().map(customerId -> {
            List<Order> orders = orderRepository
                    .findAllByStoreIdAndCustomerIdOrderByCreatedAtDesc(storeId, customerId);

            User user = userRepository.findById(customerId).orElse(null);

            String fullName = user != null ? user.getFullName() : "Cliente removido";
            String email = user != null ? user.getEmail() : "-";
            String phone = user != null ? user.getPhone() : "-";

            long totalOrders = orders.size();
            BigDecimal totalSpent = orders.stream()
                    .map(Order::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            var lastOrderDate = orders.isEmpty() ? null : orders.get(0).getCreatedAt();

            return new CustomerSummaryResponse(
                    customerId, fullName, email, phone,
                    totalOrders, totalSpent, lastOrderDate);
        }).sorted(Comparator.comparing(CustomerSummaryResponse::totalOrders).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerOrderResponse> getCustomerOrders(UUID customerId) {
        UUID storeId = TenantContext.requireCurrentTenant();

        // Verify the customer exists
        if (!userRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Cliente", "id", customerId);
        }

        List<Order> orders = orderRepository
                .findAllByStoreIdAndCustomerIdOrderByCreatedAtDesc(storeId, customerId);

        return orders.stream().map(order -> {
            List<OrderItemResponse> items = order.getItems().stream()
                    .map(item -> new OrderItemResponse(
                            item.getId(),
                            item.getProduct().getName(),
                            item.getQuantity(),
                            item.getUnitPrice()))
                    .toList();

            return new CustomerOrderResponse(
                    order.getId(),
                    order.getStatus(),
                    order.getTotal(),
                    order.getCreatedAt(),
                    items);
        }).toList();
    }
}
