package com.saas.ecommerce.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank(message = "Rua é obrigatória") @Size(max = 255) String street,

        @NotBlank(message = "Número é obrigatório") @Size(max = 20) String number,

        @Size(max = 100) String complement,

        @NotBlank(message = "Bairro é obrigatório") @Size(max = 100) String neighborhood,

        @NotBlank(message = "Cidade é obrigatória") @Size(max = 100) String city,

        @NotBlank(message = "Estado é obrigatório") @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres (UF)") String state,

        @NotBlank(message = "CEP é obrigatório") @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido. Formato: 00000-000 ou 00000000") String zipCode,

        @NotNull(message = "isDefault é obrigatório") Boolean isDefault) {
}
