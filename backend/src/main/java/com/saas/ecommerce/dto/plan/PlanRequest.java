package com.saas.ecommerce.dto.plan;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PlanRequest(
        @NotBlank(message = "Nome do plano é obrigatório") @Size(max = 50, message = "Nome deve ter no máximo 50 caracteres") String name,

        String description,

        @NotNull(message = "Preço é obrigatório") @PositiveOrZero(message = "Preço deve ser zero ou positivo") BigDecimal price,

        @NotNull(message = "Limite de produtos é obrigatório") Integer maxProducts,

        @NotNull(message = "Limite de pedidos/mês é obrigatório") Integer maxOrdersMonth,

        Boolean active) {
}
