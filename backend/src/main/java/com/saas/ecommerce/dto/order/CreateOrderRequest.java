package com.saas.ecommerce.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
        @NotEmpty(message = "O pedido deve conter ao menos um item") @Valid List<OrderItemRequest> items,

        @NotNull(message = "ID do endereço é obrigatório") UUID addressId,

        @PositiveOrZero(message = "Custo de frete não pode ser negativo") BigDecimal shippingCost) {
}
