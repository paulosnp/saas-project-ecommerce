package com.saas.ecommerce.dto.auth;

import java.util.UUID;

public record LoginResponse(
        String token,
        String role,
        UUID storeId,
        String email,
        String fullName) {
}
