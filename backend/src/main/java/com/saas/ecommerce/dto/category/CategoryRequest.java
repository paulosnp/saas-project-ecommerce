package com.saas.ecommerce.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Nome da categoria é obrigatório") @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres") String name) {
}
