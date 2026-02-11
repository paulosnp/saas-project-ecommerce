package com.saas.ecommerce.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String imageUrl,
        BigDecimal weightKg,
        BigDecimal heightCm,
        BigDecimal widthCm,
        BigDecimal lengthCm,
        Boolean active,
        UUID categoryId,
        String categoryName,
        UUID storeId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
