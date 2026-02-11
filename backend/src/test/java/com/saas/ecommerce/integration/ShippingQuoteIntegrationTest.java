package com.saas.ecommerce.integration;

import com.saas.ecommerce.dto.shipping.ShippingProduct;
import com.saas.ecommerce.dto.shipping.ShippingQuoteRequest;
import com.saas.ecommerce.dto.shipping.ShippingQuoteResponse;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.integration.melhorenvio.MelhorEnvioClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Teste de integração para cotação de frete via Melhor Envio.
 * O MelhorEnvioClient é mockado para não depender da API externa.
 */
class ShippingQuoteIntegrationTest extends AbstractIntegrationTest {

    @MockitoBean
    private MelhorEnvioClient melhorEnvioClient;

    private Store store;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        store = storeRepository.save(Store.builder()
                .name("Loja Frete")
                .slugUrl("loja-frete")
                .active(true)
                .melhorEnvioToken("test-melhor-envio-token")
                .build());
    }

    @Test
    void shouldReturnShippingQuotes() throws Exception {
        when(melhorEnvioClient.calculateShipping(eq("test-melhor-envio-token"), any(ShippingQuoteRequest.class)))
                .thenReturn(List.of(
                        new ShippingQuoteResponse(1, "SEDEX", "Correios", new BigDecimal("25.90"),
                                BigDecimal.ZERO, "BRL", 3, null),
                        new ShippingQuoteResponse(2, "PAC", "Correios", new BigDecimal("15.50"),
                                BigDecimal.ZERO, "BRL", 7, null)));

        ShippingQuoteRequest request = new ShippingQuoteRequest(
                "01001000", "80010000",
                List.of(new ShippingProduct(UUID.randomUUID(),
                        new BigDecimal("20"), new BigDecimal("10"), new BigDecimal("30"),
                        new BigDecimal("1.5"), new BigDecimal("100.00"), 1)));

        mockMvc.perform(post("/api/storefront/shipping/quote")
                .header("X-Store-ID", store.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("SEDEX")))
                .andExpect(jsonPath("$[0].price", is(25.90)))
                .andExpect(jsonPath("$[1].name", is("PAC")))
                .andExpect(jsonPath("$[1].price", is(15.50)));
    }

    @Test
    void shouldReturnEmptyWhenApiReturnsEmpty() throws Exception {
        when(melhorEnvioClient.calculateShipping(any(), any()))
                .thenReturn(List.of());

        ShippingQuoteRequest request = new ShippingQuoteRequest(
                "01001000", "80010000",
                List.of(new ShippingProduct(UUID.randomUUID(),
                        new BigDecimal("20"), new BigDecimal("10"), new BigDecimal("30"),
                        new BigDecimal("1.5"), new BigDecimal("50.00"), 1)));

        mockMvc.perform(post("/api/storefront/shipping/quote")
                .header("X-Store-ID", store.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void shouldFailValidationWithoutPostalCodes() throws Exception {
        String invalidRequest = """
                {
                    "postalCodeFrom": "",
                    "postalCodeTo": "",
                    "products": []
                }
                """;

        mockMvc.perform(post("/api/storefront/shipping/quote")
                .header("X-Store-ID", store.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }
}
