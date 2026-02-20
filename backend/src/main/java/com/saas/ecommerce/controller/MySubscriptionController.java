package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.dto.subscription.MySubscriptionResponse;
import com.saas.ecommerce.service.PlanService;
import com.saas.ecommerce.service.SubscriptionService;
import com.saas.ecommerce.tenant.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin - Minha Assinatura")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyAuthority('ADMIN_LOJA', 'SUPER_ADMIN')")
public class MySubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PlanService planService;

    @GetMapping("/my-subscription")
    @Operation(summary = "Dados da assinatura atual da loja")
    public MySubscriptionResponse getMySubscription() {
        UUID storeId = TenantContext.requireCurrentTenant();
        return subscriptionService.getMySubscription(storeId);
    }

    @GetMapping("/plans")
    @Operation(summary = "Listar planos disponíveis")
    public List<PlanResponse> getAvailablePlans() {
        return planService.findAllActive();
    }

    @PutMapping("/my-subscription/change-plan")
    @Operation(summary = "Trocar plano da assinatura")
    public MySubscriptionResponse changePlan(@RequestBody Map<String, String> body) {
        UUID storeId = TenantContext.requireCurrentTenant();
        UUID planId = UUID.fromString(body.get("planId"));
        return subscriptionService.changePlan(storeId, planId);
    }
}
