package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.product.ProductRequest;
import com.saas.ecommerce.dto.product.ProductResponse;
import com.saas.ecommerce.service.ProductService;
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

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ========== ADMIN (autenticado, store_id via JWT) ==========

    @Tag(name = "Admin - Produtos")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/admin/products")
    @Operation(summary = "Listar produtos da loja", description = "Retorna todos os produtos da loja do admin autenticado")
    public ResponseEntity<Page<ProductResponse>> adminFindAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(productService.findAll(pageable));
    }

    @Tag(name = "Admin - Produtos")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/admin/products/{id}")
    @Operation(summary = "Buscar produto por ID")
    public ResponseEntity<ProductResponse> adminFindById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @Tag(name = "Admin - Produtos")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/api/admin/products")
    @Operation(summary = "Criar produto", description = "Cria produto na loja do admin autenticado")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @Tag(name = "Admin - Produtos")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/api/admin/products/{id}")
    @Operation(summary = "Atualizar produto")
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @Tag(name = "Admin - Produtos")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/api/admin/products/{id}")
    @Operation(summary = "Excluir produto")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ========== STOREFRONT (público, store_id via header X-Store-ID) ==========

    @Tag(name = "Storefront - Produtos")
    @GetMapping("/api/storefront/products")
    @Operation(summary = "Listar produtos ativos da loja", description = "Público. Store identificada via X-Store-ID header")
    public ResponseEntity<Page<ProductResponse>> storefrontFindAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(productService.findAllActive(pageable));
    }

    @Tag(name = "Storefront - Produtos")
    @GetMapping("/api/storefront/products/{id}")
    @Operation(summary = "Buscar produto ativo por ID")
    public ResponseEntity<ProductResponse> storefrontFindById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }
}
