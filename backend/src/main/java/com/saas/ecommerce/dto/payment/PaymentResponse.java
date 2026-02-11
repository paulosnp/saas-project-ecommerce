package com.saas.ecommerce.dto.payment;

public record PaymentResponse(
        String initPoint,
        String preferenceId) {
}
