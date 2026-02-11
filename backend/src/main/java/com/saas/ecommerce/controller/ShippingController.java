package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.shipping.ShippingQuoteRequest;
import com.saas.ecommerce.dto.shipping.ShippingQuoteResponse;
import com.saas.ecommerce.service.ShippingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/storefront/shipping")
@RequiredArgsConstructor
@Tag(name = "Frete (Storefront)")
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping("/quote")
    @Operation(summary = "Calcular frete (Melhor Envio)")
    public List<ShippingQuoteResponse> calculateShipping(@Valid @RequestBody ShippingQuoteRequest request) {
        return shippingService.calculateShipping(request);
    }
}
