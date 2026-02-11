package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.shipping.ShippingQuoteRequest;
import com.saas.ecommerce.dto.shipping.ShippingQuoteResponse;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.integration.melhorenvio.MelhorEnvioClient;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final MelhorEnvioClient melhorEnvioClient;
    private final StoreRepository storeRepository;

    public List<ShippingQuoteResponse> calculateShipping(ShippingQuoteRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalStateException("Loja não encontrada"));

        if (store.getMelhorEnvioToken() == null || store.getMelhorEnvioToken().isBlank()) {
            throw new IllegalStateException("Loja não possui token do Melhor Envio configurado");
        }

        return melhorEnvioClient.calculateShipping(store.getMelhorEnvioToken(), request);
    }
}
