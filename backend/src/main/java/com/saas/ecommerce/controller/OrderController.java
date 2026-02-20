package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.order.CreateOrderRequest;
import com.saas.ecommerce.dto.order.OrderResponse;
import com.saas.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.saas.ecommerce.security.CustomUserDetails;
import com.saas.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Pedidos")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    // --- Storefront / Customer Endpoints ---

    @PostMapping("/storefront/orders")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar novo pedido (Cliente)")
    @PreAuthorize("hasAuthority('CLIENTE')")
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return orderService.createOrder(request, user.getId());
    }

    @GetMapping("/customer/orders")
    @Operation(summary = "Listar meus pedidos")
    @PreAuthorize("hasAuthority('CLIENTE')")
    public Page<OrderResponse> listMyOrders(@AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.findAllByCustomer(user.getId(), pageable);
    }

    @GetMapping("/customer/orders/{id}")
    @Operation(summary = "Detalhes do meu pedido")
    @PreAuthorize("hasAuthority('CLIENTE')")
    public OrderResponse getMyOrder(@PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails user) {
        return orderService.findByIdAndCustomer(id, user.getId());
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/orders")
    @Operation(summary = "Listar pedidos da loja (Admin)")
    @PreAuthorize("hasAnyAuthority('ADMIN_LOJA', 'SUPER_ADMIN')")
    public Page<OrderResponse> listStoreOrders(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.findAllByStore(pageable);
    }

    @GetMapping("/admin/orders/{id}")
    @Operation(summary = "Detalhes do pedido (Admin)")
    @PreAuthorize("hasAnyAuthority('ADMIN_LOJA', 'SUPER_ADMIN')")
    public OrderResponse getStoreOrder(@PathVariable UUID id) {
        return orderService.findById(id);
    }

    @PutMapping("/admin/orders/{id}/status")
    @Operation(summary = "Atualizar status do pedido (Admin)")
    @PreAuthorize("hasAnyAuthority('ADMIN_LOJA', 'SUPER_ADMIN')")
    public OrderResponse updateStatus(@PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request);
    }
}
