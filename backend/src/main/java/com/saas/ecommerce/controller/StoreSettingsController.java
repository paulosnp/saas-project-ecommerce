package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.store.StoreSettingsRequest;
import com.saas.ecommerce.dto.store.StoreSettingsResponse;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.tenant.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/store/settings")
@RequiredArgsConstructor
@Tag(name = "Admin - Configurações da Loja", description = "Gerenciamento das configurações da loja")
@SecurityRequirement(name = "bearerAuth")
public class StoreSettingsController {

    private final StoreRepository storeRepository;

    @GetMapping
    @Operation(summary = "Obter configurações", description = "Retorna as configurações da loja do admin autenticado")
    public ResponseEntity<StoreSettingsResponse> getSettings() {
        UUID storeId = TenantContext.requireCurrentTenant();
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada"));
        return ResponseEntity.ok(toResponse(store));
    }

    @PutMapping
    @Operation(summary = "Atualizar configurações", description = "Atualiza nome, URL, logo, banner e cor da loja")
    public ResponseEntity<StoreSettingsResponse> updateSettings(@Valid @RequestBody StoreSettingsRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Loja não encontrada"));

        store.setName(request.name());
        store.setSlugUrl(request.slugUrl());
        store.setPrimaryColor(request.primaryColor());
        store.setLogoUrl(request.logoUrl());
        store.setBannerUrl(request.bannerUrl());
        store.setMercadoPagoToken(request.mercadoPagoToken());
        store.setMelhorEnvioToken(request.melhorEnvioToken());

        store = storeRepository.save(store);
        return ResponseEntity.ok(toResponse(store));
    }

    private StoreSettingsResponse toResponse(Store store) {
        return new StoreSettingsResponse(
                store.getId(),
                store.getName(),
                store.getSlugUrl(),
                store.getPrimaryColor(),
                store.getLogoUrl(),
                store.getBannerUrl(),
                maskToken(store.getMercadoPagoToken()),
                maskToken(store.getMelhorEnvioToken()),
                store.getActive());
    }

    private String maskToken(String token) {
        if (token == null || token.length() < 8)
            return token;
        return token.substring(0, 4) + "****" + token.substring(token.length() - 4);
    }
}
