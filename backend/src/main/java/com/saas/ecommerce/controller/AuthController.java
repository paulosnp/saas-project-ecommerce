package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.auth.LoginRequest;
import com.saas.ecommerce.dto.auth.LoginResponse;
import com.saas.ecommerce.dto.auth.RegisterRequest;
import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.service.AuthService;
import com.saas.ecommerce.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Login e registro de usuários")
public class AuthController {

    private final AuthService authService;
    private final PlanService planService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica e retorna JWT com store_id para ADMIN_LOJA")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/store")
    @Operation(summary = "Registrar Lojista", description = "Cria loja + usuário ADMIN_LOJA e retorna JWT")
    public ResponseEntity<LoginResponse> registerStoreOwner(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerStoreOwner(request));
    }

    @PostMapping("/register/customer")
    @Operation(summary = "Registrar Cliente", description = "Cria usuário CLIENTE e retorna JWT")
    public ResponseEntity<LoginResponse> registerCustomer(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerCustomer(request));
    }

    @GetMapping("/plans")
    @Operation(summary = "Planos disponíveis", description = "Lista planos ativos para a página de registro (público)")
    public ResponseEntity<List<PlanResponse>> getAvailablePlans() {
        return ResponseEntity.ok(planService.findAllActive());
    }
}
