package com.saas.ecommerce.dto.product;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        @NotBlank(message = "Nome do produto é obrigatório") @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres") String name,

        String description,

        @NotNull(message = "Preço é obrigatório") @PositiveOrZero(message = "Preço deve ser zero ou positivo") BigDecimal price,

        @NotNull(message = "Quantidade em estoque é obrigatória") @Min(value = 0, message = "Estoque não pode ser negativo") Integer stockQuantity,

        String imageUrl,

        @PositiveOrZero(message = "Peso deve ser positivo") BigDecimal weightKg,

        @PositiveOrZero(message = "Altura deve ser positiva") BigDecimal heightCm,

        @PositiveOrZero(message = "Largura deve ser positiva") BigDecimal widthCm,

        @PositiveOrZero(message = "Comprimento deve ser positivo") BigDecimal lengthCm,

        @NotNull(message = "Categoria é obrigatória") UUID categoryId,

        Boolean active) {
}
