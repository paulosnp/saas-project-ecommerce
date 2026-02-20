package com.saas.ecommerce.dto.subscription;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MySubscriptionResponse(
        UUID subscriptionId,
        String status,
        LocalDateTime startsAt,
        LocalDateTime expiresAt,
        LocalDateTime cancelledAt,
        String planName,
        String planDescription,
        BigDecimal planPrice,
        Integer maxProducts,
        Integer maxOrdersMonth) {
}
