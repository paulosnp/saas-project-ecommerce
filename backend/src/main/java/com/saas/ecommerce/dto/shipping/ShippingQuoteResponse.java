package com.saas.ecommerce.dto.shipping;

import java.math.BigDecimal;

public record ShippingQuoteResponse(
        Integer id,
        String name,
        String company,
        BigDecimal price,
        BigDecimal discount,
        String currency,
        Integer deliveryTime,
        String error) {
}
