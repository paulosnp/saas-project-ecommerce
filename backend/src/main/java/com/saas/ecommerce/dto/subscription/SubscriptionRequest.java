package com.saas.ecommerce.dto.subscription;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubscriptionRequest(
        @NotNull(message = "ID da loja é obrigatório") UUID storeId,

        @NotNull(message = "ID do plano é obrigatório") UUID planId) {
}
