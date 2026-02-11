package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.dashboard.DashboardResponse;
import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.enums.OrderStatus;
import com.saas.ecommerce.repository.OrderRepository;
import com.saas.ecommerce.repository.ProductRepository;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;

        @Transactional(readOnly = true)
        public DashboardResponse getDashboard() {
                UUID storeId = TenantContext.requireCurrentTenant();
                LocalDateTime todayStart = LocalDate.now().atStartOfDay();

                long totalOrders = orderRepository.countByStoreId(storeId);
                long ordersToday = orderRepository.countByStoreIdAndCreatedAtAfter(storeId, todayStart);
                long pendingOrders = orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.AWAITING_PAYMENT);

                long totalProducts = productRepository.countByStoreId(storeId);
                long activeProducts = productRepository.countByStoreIdAndActiveTrue(storeId);

                BigDecimal totalRevenue = orderRepository.sumTotalByStoreIdAndStatusIn(storeId,
                                List.of(OrderStatus.PAYMENT_CONFIRMED, OrderStatus.PROCESSING,
                                                OrderStatus.SHIPPED, OrderStatus.DELIVERED));

                List<Order> recentOrders = orderRepository.findTop5ByStoreIdOrderByCreatedAtDesc(storeId);

                List<DashboardResponse.RecentOrderDto> recentDtos = recentOrders.stream()
                                .map(o -> new DashboardResponse.RecentOrderDto(
                                                o.getId().toString(),
                                                o.getStatus().name(),
                                                o.getTotal(),
                                                o.getCreatedAt().toString()))
                                .toList();

                return new DashboardResponse(
                                totalOrders, ordersToday, pendingOrders,
                                totalProducts, activeProducts,
                                totalRevenue, recentDtos);
        }
}
