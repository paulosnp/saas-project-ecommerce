package com.saas.ecommerce.dto.shipping;

import java.math.BigDecimal;
import java.util.UUID;

public record ShippingProduct(
        UUID id,
        BigDecimal width,
        BigDecimal height,
        BigDecimal length,
        BigDecimal weight,
        BigDecimal insuranceValue,
        Integer quantity) {
}
