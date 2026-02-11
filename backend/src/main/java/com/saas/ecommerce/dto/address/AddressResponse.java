package com.saas.ecommerce.dto.address;

import java.time.LocalDateTime;
import java.util.UUID;

public record AddressResponse(
        UUID id,
        String street,
        String number,
        String complement,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        Boolean isDefault,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
