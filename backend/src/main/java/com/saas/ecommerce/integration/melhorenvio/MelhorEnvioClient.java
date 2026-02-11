package com.saas.ecommerce.integration.melhorenvio;

import com.saas.ecommerce.dto.shipping.ShippingQuoteRequest;
import com.saas.ecommerce.dto.shipping.ShippingQuoteResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MelhorEnvioClient {

    private static final Logger log = LoggerFactory.getLogger(MelhorEnvioClient.class);

    @Value("${integration.melhor-envio.base-url}")
    private String baseUrl;

    @Value("${integration.melhor-envio.user-agent:SaaS Ecommerce}")
    private String userAgent;

    private final RestClient.Builder restClientBuilder;

    public List<ShippingQuoteResponse> calculateShipping(String token, ShippingQuoteRequest request) {
        try {
            return restClientBuilder.baseUrl(baseUrl).build()
                    .post()
                    .uri("/me/shipment/calculate")
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/json")
                    .header("User-Agent", userAgent)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<ShippingQuoteResponse>>() {
                    });
        } catch (RestClientException e) {
            log.error("Erro ao consultar Melhor Envio: {}", e.getMessage());
            // Em caso de erro, retorna lista vazia ou lança exceção personalizada,
            // aqui optamos por retornar vazio para não quebrar o checkout, mas idealmente
            // alertaria o usuário.
            return Collections.emptyList();
        }
    }
}
