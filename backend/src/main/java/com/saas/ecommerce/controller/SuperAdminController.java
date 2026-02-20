package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.plan.PlanRequest;
import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.dto.store.StoreResponse;
import com.saas.ecommerce.dto.subscription.SubscriptionRequest;
import com.saas.ecommerce.dto.subscription.SubscriptionResponse;
import com.saas.ecommerce.entity.Plan;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.Subscription;
import com.saas.ecommerce.enums.SubscriptionStatus;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.repository.PlanRepository;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.repository.SubscriptionRepository;
import com.saas.ecommerce.service.PlanService;
import com.saas.ecommerce.service.PlatformSettingsService;
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

import java.math.BigDecimal;
import java.util.*;

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
    private final PlatformSettingsService platformSettingsService;
    private final PlanRepository planRepository;

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

    @GetMapping("/plans/{id}/subscriptions-count")
    @Operation(summary = "Contar assinaturas ativas de um plano")
    public ResponseEntity<Map<String, Object>> getPlanSubscriptionsCount(@PathVariable UUID id) {
        long count = planService.countActiveSubscriptions(id);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @DeleteMapping("/plans/{id}")
    @Operation(summary = "Excluir plano (com migração opcional)")
    public ResponseEntity<Void> deletePlan(@PathVariable UUID id,
            @RequestParam(required = false) UUID migrateTo) {
        planService.delete(id, migrateTo);
        return ResponseEntity.noContent().build();
    }

    // ========== DASHBOARD ==========

    @GetMapping("/dashboard")
    @Operation(summary = "KPIs do dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        long totalStores = storeRepository.count();
        long activeStores = storeRepository.countByActive(true);

        List<Subscription> allSubs = subscriptionRepository.findAll();
        long activeSubs = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE).count();
        long trialSubs = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.TRIAL).count();
        long cancelledSubs = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.CANCELLED).count();
        long expiredSubs = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.EXPIRED).count();

        // Estimated monthly revenue from active subscriptions
        BigDecimal monthlyRevenue = allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE || s.getStatus() == SubscriptionStatus.TRIAL)
                .map(s -> planRepository.findById(s.getPlanId())
                        .map(Plan::getPrice).orElse(BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Plan distribution
        Map<String, Long> planDistribution = new LinkedHashMap<>();
        allSubs.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE || s.getStatus() == SubscriptionStatus.TRIAL)
                .forEach(s -> {
                    String planName = planRepository.findById(s.getPlanId())
                            .map(Plan::getName).orElse("Desconhecido");
                    planDistribution.merge(planName, 1L, Long::sum);
                });

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalStores", totalStores);
        dashboard.put("activeStores", activeStores);
        dashboard.put("activeSubscriptions", activeSubs);
        dashboard.put("trialSubscriptions", trialSubs);
        dashboard.put("cancelledSubscriptions", cancelledSubs);
        dashboard.put("expiredSubscriptions", expiredSubs);
        dashboard.put("monthlyRevenue", monthlyRevenue);
        dashboard.put("planDistribution", planDistribution);

        return ResponseEntity.ok(dashboard);
    }

    // ========== CONFIGURAÇÕES ==========

    @GetMapping("/settings")
    @Operation(summary = "Obter configurações da plataforma")
    public ResponseEntity<Map<String, Object>> getSettings() {
        String rawToken = platformSettingsService.getMercadoPagoAccessToken();
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("mercadoPagoToken", platformSettingsService.maskToken(rawToken));
        settings.put("mercadoPagoConfigured", !rawToken.isBlank());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    @Operation(summary = "Atualizar configurações da plataforma")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, String> body) {
        if (body.containsKey("mercadoPagoToken")) {
            String token = body.get("mercadoPagoToken");
            if (token != null && !token.isBlank()) {
                platformSettingsService.set(
                        PlatformSettingsService.KEY_MP_ACCESS_TOKEN,
                        token,
                        "Access Token do Mercado Pago da plataforma");
            }
        }

        // Return updated (masked) settings
        String rawToken = platformSettingsService.getMercadoPagoAccessToken();
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("mercadoPagoToken", platformSettingsService.maskToken(rawToken));
        settings.put("mercadoPagoConfigured", !rawToken.isBlank());
        return ResponseEntity.ok(settings);
    }

    // ========== HELPERS ==========

    private StoreResponse toStoreResponse(Store store) {
        Subscription activeSub = subscriptionRepository
                .findByStoreIdAndStatus(store.getId(), SubscriptionStatus.ACTIVE)
                .orElse(null);

        String planName = "SEM PLANO";
        String subStatus = "INACTIVE";
        if (activeSub != null) {
            subStatus = activeSub.getStatus().name();
            planName = planRepository.findById(activeSub.getPlanId())
                    .map(Plan::getName).orElse("DESCONHECIDO");
        }

        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getSlugUrl(),
                store.getBannerUrl(),
                store.getLogoUrl(),
                store.getPrimaryColor(),
                store.getActive(),
                planName,
                subStatus,
                store.getCreatedAt());
    }
}
