package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.address.AddressRequest;
import com.saas.ecommerce.dto.address.AddressResponse;
import com.saas.ecommerce.security.CustomUserDetails;
import com.saas.ecommerce.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer/addresses")
@RequiredArgsConstructor
@Tag(name = "Endereços do Cliente")
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Listar meus endereços")
    public List<AddressResponse> findAll(@AuthenticationPrincipal CustomUserDetails user) {
        return addressService.findAllByUser(user.getId());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar endereço por ID")
    public AddressResponse findById(@PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails user) {
        return addressService.findByIdAndUser(id, user.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar endereço")
    public AddressResponse create(@Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return addressService.create(request, user.getId());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar endereço")
    public AddressResponse update(@PathVariable UUID id,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return addressService.update(id, request, user.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir endereço")
    public void delete(@PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails user) {
        addressService.delete(id, user.getId());
    }
}
