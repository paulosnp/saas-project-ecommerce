package com.saas.ecommerce.dto.category;

import java.time.LocalDateTime;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        UUID storeId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
