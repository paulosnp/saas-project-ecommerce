package com.saas.ecommerce.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CustomerSummaryResponse(
        UUID customerId,
        String fullName,
        String email,
        String phone,
        long totalOrders,
        BigDecimal totalSpent,
        LocalDateTime lastOrderDate) {
}
