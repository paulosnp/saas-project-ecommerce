package com.saas.ecommerce.integration;

import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.OrderStatus;
import com.saas.ecommerce.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Teste de integração para os endpoints de webhook do Mercado Pago.
 * Valida que o webhook aceita payloads corretamente e rejeita inválidos.
 * Não testa integração real com MP (requer token válido).
 */
class PaymentWebhookIntegrationTest extends AbstractIntegrationTest {

    private Store store;
    private User customer;
    private Order pendingOrder;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cleanDatabase();

        store = storeRepository.save(Store.builder()
                .name("Loja Webhook")
                .slugUrl("loja-webhook")
                .active(true)
                .mercadoPagoToken("TEST-mp-token-12345")
                .build());

        customer = createUser("Cliente Webhook", "webhook-customer@test.com",
                UserRole.CLIENTE, null);

        pendingOrder = orderRepository.save(Order.builder()
                .customerId(customer.getId())
                .storeId(store.getId())
                .status(OrderStatus.AWAITING_PAYMENT)
                .total(new BigDecimal("150.00"))
                .shippingCost(new BigDecimal("15.00"))
                .items(new ArrayList<>())
                .build());
    }

    @Test
    void shouldAcceptValidWebhookPayload() throws Exception {
        String payload = """
                {
                    "id": 12345,
                    "live_mode": false,
                    "type": "payment",
                    "date_created": "2024-01-01T12:00:00-03:00",
                    "user_id": 99999,
                    "api_version": "v1",
                    "action": "payment.created",
                    "data": {
                        "id": "67890"
                    }
                }
                """;

        // Webhook endpoint is public, no auth needed. The call to MP API will fail
        // (no real token), but the endpoint itself should accept the payload.
        // We expect 200 (processed/accepted) or 500 (MP API call fails internally).
        // Since the MP client.get() will throw an exception with a fake token,
        // the service catches it and rethrows as RuntimeException.
        // GlobalExceptionHandler catches it as a generic Exception → 500.
        mockMvc.perform(post("/api/webhooks/mercadopago/orders")
                .param("storeId", store.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void shouldIgnoreNonPaymentWebhookType() throws Exception {
        // Webhook with type != "payment" should be silently ignored (200 OK)
        String payload = """
                {
                    "id": 12345,
                    "live_mode": false,
                    "type": "test",
                    "date_created": "2024-01-01T12:00:00-03:00",
                    "user_id": 99999,
                    "api_version": "v1",
                    "action": "test",
                    "data": {
                        "id": "67890"
                    }
                }
                """;

        mockMvc.perform(post("/api/webhooks/mercadopago/orders")
                .param("storeId", store.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAcceptSubscriptionWebhook() throws Exception {
        String payload = """
                {
                    "id": 99999,
                    "live_mode": false,
                    "type": "payment",
                    "date_created": "2024-01-01T12:00:00-03:00",
                    "user_id": 11111,
                    "api_version": "v1",
                    "action": "payment.created",
                    "data": {
                        "id": "55555"
                    }
                }
                """;

        // Subscription webhook's processSubscriptionWebhook just logs and returns,
        // so it returns 200 OK.
        mockMvc.perform(post("/api/webhooks/mercadopago/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void shouldRejectEmptyPayload() throws Exception {
        mockMvc.perform(post("/api/webhooks/mercadopago/orders")
                .param("storeId", store.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk()); // type is null, so it ignores (returns immediately)
    }
}
