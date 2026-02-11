package com.saas.ecommerce.dto.store;

import java.util.UUID;

public record StoreSettingsResponse(
        UUID id,
        String name,
        String slugUrl,
        String primaryColor,
        String logoUrl,
        String bannerUrl,
        String mercadoPagoToken,
        String melhorEnvioToken,
        Boolean active) {
}
