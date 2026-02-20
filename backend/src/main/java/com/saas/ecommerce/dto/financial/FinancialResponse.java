package com.saas.ecommerce.dto.financial;

import java.math.BigDecimal;

public record FinancialResponse(
        BigDecimal totalRevenue,
        BigDecimal revenueToday,
        BigDecimal revenueLast7Days,
        BigDecimal revenueLast30Days,
        long totalOrders,
        long ordersCompleted,
        long ordersCancelled,
        long ordersPending,
        BigDecimal averageOrderValue) {
}
