package com.saas.ecommerce.dto.payment;

import java.util.UUID;

public record CreatePaymentRequest(
        UUID orderId) {
}
