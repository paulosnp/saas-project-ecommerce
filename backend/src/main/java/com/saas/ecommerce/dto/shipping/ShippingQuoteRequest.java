package com.saas.ecommerce.dto.shipping;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ShippingQuoteRequest(
        @NotBlank(message = "CEP de origem é obrigatório") String postalCodeFrom,

        @NotBlank(message = "CEP de destino é obrigatório") String postalCodeTo,

        @NotEmpty(message = "Lista de produtos é obrigatória") @Valid List<ShippingProduct> products) {
}
