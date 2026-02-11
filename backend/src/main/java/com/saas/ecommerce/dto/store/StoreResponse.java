package com.saas.ecommerce.dto.store;

import java.time.LocalDateTime;
import java.util.UUID;

public record StoreResponse(
        UUID id,
        String name,
        String slugUrl,
        String bannerUrl,
        String logoUrl,
        String primaryColor,
        Boolean active,
        String currentPlan,
        String subscriptionStatus,
        LocalDateTime createdAt) {
}
