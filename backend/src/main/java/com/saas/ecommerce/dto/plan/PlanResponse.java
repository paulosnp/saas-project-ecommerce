package com.saas.ecommerce.dto.plan;

import java.math.BigDecimal;
import java.util.UUID;

public record PlanResponse(
                UUID id,
                String name,
                String description,
                BigDecimal price,
                Integer maxProducts,
                Integer maxOrdersMonth,
                Boolean active,
                Integer displayOrder) {
}
