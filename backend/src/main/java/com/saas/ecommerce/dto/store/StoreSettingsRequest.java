package com.saas.ecommerce.dto.store;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StoreSettingsRequest(
        @NotBlank(message = "Nome da loja é obrigatório") @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres") String name,

        @NotBlank(message = "URL da loja é obrigatória") @Size(max = 100, message = "URL deve ter no máximo 100 caracteres") @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "URL deve conter apenas letras minúsculas, números e hífens") String slugUrl,

        @Size(max = 7) String primaryColor,

        String logoUrl,

        String bannerUrl,

        String mercadoPagoToken,

        String melhorEnvioToken) {
}
