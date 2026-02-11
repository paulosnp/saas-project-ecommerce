package com.saas.ecommerce.dto.subscription;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        UUID storeId,
        String storeName,
        UUID planId,
        String planName,
        String status,
        LocalDateTime startsAt,
        LocalDateTime expiresAt,
        LocalDateTime cancelledAt,
        LocalDateTime createdAt) {
}
