package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.financial.FinancialResponse;
import com.saas.ecommerce.enums.OrderStatus;
import com.saas.ecommerce.repository.OrderRepository;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialService {

    private final OrderRepository orderRepository;

    private static final List<OrderStatus> PAID_STATUSES = List.of(
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED);

    @Transactional(readOnly = true)
    public FinancialResponse getFinancialSummary() {
        UUID storeId = TenantContext.requireCurrentTenant();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime last7Days = now.minusDays(7);
        LocalDateTime last30Days = now.minusDays(30);

        // Revenue calculations
        BigDecimal totalRevenue = orderRepository.sumTotalByStoreIdAndStatusIn(storeId, PAID_STATUSES);
        BigDecimal revenueToday = orderRepository.sumTotalByStoreIdAndStatusInAndCreatedAtAfter(
                storeId, PAID_STATUSES, todayStart);
        BigDecimal revenueLast7Days = orderRepository.sumTotalByStoreIdAndStatusInAndCreatedAtAfter(
                storeId, PAID_STATUSES, last7Days);
        BigDecimal revenueLast30Days = orderRepository.sumTotalByStoreIdAndStatusInAndCreatedAtAfter(
                storeId, PAID_STATUSES, last30Days);

        // Order counts
        long totalOrders = orderRepository.countByStoreId(storeId);

        long ordersCompleted = orderRepository.countByStoreIdAndStatusIn(storeId,
                List.of(OrderStatus.DELIVERED));

        long ordersCancelled = orderRepository.countByStoreIdAndStatusIn(storeId,
                List.of(OrderStatus.CANCELLED));

        long ordersPending = orderRepository.countByStoreIdAndStatusIn(storeId,
                List.of(OrderStatus.AWAITING_PAYMENT, OrderStatus.PENDING));

        // Average order value
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (totalOrders > 0 && totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            averageOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }

        return new FinancialResponse(
                totalRevenue, revenueToday, revenueLast7Days, revenueLast30Days,
                totalOrders, ordersCompleted, ordersCancelled, ordersPending,
                averageOrderValue);
    }
}
