package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.financial.FinancialResponse;
import com.saas.ecommerce.service.FinancialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/financial")
@RequiredArgsConstructor
@Tag(name = "Admin - Financeiro")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN_LOJA')")
public class FinancialController {

    private final FinancialService financialService;

    @GetMapping
    @Operation(summary = "Resumo financeiro da loja", description = "Retorna receita por período, contagem de pedidos por status e ticket médio")
    public FinancialResponse getFinancialSummary() {
        return financialService.getFinancialSummary();
    }
}
