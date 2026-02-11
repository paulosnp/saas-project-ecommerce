package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.category.CategoryRequest;
import com.saas.ecommerce.dto.category.CategoryResponse;
import com.saas.ecommerce.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // ========== ADMIN (autenticado, store_id via JWT) ==========

    @Tag(name = "Admin - Categorias")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/admin/categories")
    @Operation(summary = "Listar categorias da loja", description = "Retorna todas as categorias da loja do admin autenticado")
    public ResponseEntity<List<CategoryResponse>> adminFindAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @Tag(name = "Admin - Categorias")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/admin/categories/{id}")
    @Operation(summary = "Buscar categoria por ID")
    public ResponseEntity<CategoryResponse> adminFindById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    @Tag(name = "Admin - Categorias")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/api/admin/categories")
    @Operation(summary = "Criar categoria", description = "Cria categoria na loja do admin autenticado")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @Tag(name = "Admin - Categorias")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/api/admin/categories/{id}")
    @Operation(summary = "Atualizar categoria")
    public ResponseEntity<CategoryResponse> update(@PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @Tag(name = "Admin - Categorias")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/api/admin/categories/{id}")
    @Operation(summary = "Excluir categoria")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ========== STOREFRONT (público, store_id via header X-Store-ID) ==========

    @Tag(name = "Storefront - Categorias")
    @GetMapping("/api/storefront/categories")
    @Operation(summary = "Listar categorias da loja", description = "Público. Store identificada via X-Store-ID header")
    public ResponseEntity<List<CategoryResponse>> storefrontFindAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }
}
