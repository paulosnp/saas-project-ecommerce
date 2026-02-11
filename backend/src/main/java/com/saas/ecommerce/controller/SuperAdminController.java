package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.plan.PlanRequest;
import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.dto.store.StoreResponse;
import com.saas.ecommerce.dto.subscription.SubscriptionRequest;
import com.saas.ecommerce.dto.subscription.SubscriptionResponse;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.Subscription;
import com.saas.ecommerce.enums.SubscriptionStatus;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.repository.SubscriptionRepository;
import com.saas.ecommerce.service.PlanService;
import com.saas.ecommerce.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Super Admin", description = "Gerenciamento da plataforma (somente SUPER_ADMIN)")
public class SuperAdminController {

    private final StoreRepository storeRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;
    private final PlanService planService;

    // ========== LOJAS ==========

    @GetMapping("/stores")
    @Operation(summary = "Listar todas as lojas")
    public ResponseEntity<Page<StoreResponse>> listStores(@PageableDefault(size = 20) Pageable pageable) {
        Page<StoreResponse> stores = storeRepository.findAll(pageable).map(this::toStoreResponse);
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/stores/{id}")
    @Operation(summary = "Detalhes de uma loja")
    public ResponseEntity<StoreResponse> getStore(@PathVariable UUID id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loja", "id", id));
        return ResponseEntity.ok(toStoreResponse(store));
    }

    @PutMapping("/stores/{id}/status")
    @Operation(summary = "Ativar/desativar loja")
    public ResponseEntity<StoreResponse> toggleStoreStatus(@PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loja", "id", id));
        store.setActive(body.getOrDefault("active", true));
        store = storeRepository.save(store);
        return ResponseEntity.ok(toStoreResponse(store));
    }

    // ========== ASSINATURAS ==========

    @GetMapping("/subscriptions")
    @Operation(summary = "Listar assinaturas")
    public ResponseEntity<Page<SubscriptionResponse>> listSubscriptions(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(subscriptionService.findAll(pageable));
    }

    @PostMapping("/subscriptions")
    @Operation(summary = "Criar assinatura para uma loja")
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.create(request));
    }

    @PutMapping("/subscriptions/{id}/status")
    @Operation(summary = "Alterar status da assinatura")
    public ResponseEntity<SubscriptionResponse> updateSubscriptionStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        SubscriptionStatus status = SubscriptionStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(subscriptionService.updateStatus(id, status));
    }

    // ========== PLANOS ==========

    @GetMapping("/plans")
    @Operation(summary = "Listar todos os planos")
    public ResponseEntity<List<PlanResponse>> listPlans() {
        return ResponseEntity.ok(planService.findAll());
    }

    @PostMapping("/plans")
    @Operation(summary = "Criar plano")
    public ResponseEntity<PlanResponse> createPlan(@Valid @RequestBody PlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.create(request));
    }

    @PutMapping("/plans/{id}")
    @Operation(summary = "Atualizar plano")
    public ResponseEntity<PlanResponse> updatePlan(@PathVariable UUID id,
            @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(planService.update(id, request));
    }

    // ========== HELPERS ==========

    private StoreResponse toStoreResponse(Store store) {
        Subscription activeSub = subscriptionRepository
                .findByStoreIdAndStatus(store.getId(), SubscriptionStatus.ACTIVE)
                .orElse(null);

        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getSlugUrl(),
                store.getBannerUrl(),
                store.getLogoUrl(),
                store.getPrimaryColor(),
                store.getActive(),
                activeSub != null ? activeSub.getPlan().getName() : "SEM PLANO",
                activeSub != null ? activeSub.getStatus().name() : "INACTIVE",
                store.getCreatedAt());
    }
}
