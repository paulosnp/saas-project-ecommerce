package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.customer.CustomerOrderResponse;
import com.saas.ecommerce.dto.customer.CustomerSummaryResponse;
import com.saas.ecommerce.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Admin - Clientes")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN_LOJA')")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Listar clientes que fizeram pedidos")
    public List<CustomerSummaryResponse> listCustomers() {
        return customerService.getCustomerSummaries();
    }

    @GetMapping("/{id}/orders")
    @Operation(summary = "Listar pedidos de um cliente")
    public List<CustomerOrderResponse> getCustomerOrders(@PathVariable UUID id) {
        return customerService.getCustomerOrders(id);
    }
}
