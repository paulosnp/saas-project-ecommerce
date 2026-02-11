package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.dashboard.DashboardResponse;
import com.saas.ecommerce.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin - Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Métricas do dashboard", description = "Retorna KPIs e pedidos recentes da loja")
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}
