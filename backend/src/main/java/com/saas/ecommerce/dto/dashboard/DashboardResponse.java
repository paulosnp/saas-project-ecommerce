package com.saas.ecommerce.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        long totalOrders,
        long ordersToday,
        long pendingOrders,
        long totalProducts,
        long activeProducts,
        BigDecimal totalRevenue,
        List<RecentOrderDto> recentOrders) {

    public record RecentOrderDto(
            String id,
            String status,
            BigDecimal total,
            String createdAt) {
    }
}
