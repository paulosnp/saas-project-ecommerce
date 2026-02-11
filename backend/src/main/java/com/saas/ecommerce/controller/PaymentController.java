package com.saas.ecommerce.controller;

import com.saas.ecommerce.dto.payment.CreatePaymentRequest;
import com.saas.ecommerce.dto.payment.PaymentResponse;
import com.saas.ecommerce.dto.payment.WebhookPayload;
import com.saas.ecommerce.integration.mercadopago.MercadoPagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Pagamentos")
@Slf4j
public class PaymentController {

    private final MercadoPagoService mercadoPagoService;

    @PostMapping("/storefront/payments")
    @Operation(summary = "Criar pagamento (checkout)")
    public PaymentResponse createPayment(@RequestBody CreatePaymentRequest request) {
        return mercadoPagoService.createOrderPreference(request.orderId());
    }

    @PostMapping("/webhooks/mercadopago/orders")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Webhook Mercado Pago (Pedidos)")
    public void handleOrderWebhook(@RequestBody WebhookPayload payload,
            @RequestParam String storeId) {
        log.info("Recebido webhook MP para loja {}: {}", storeId, payload);
        mercadoPagoService.processOrderWebhook(payload, storeId);
    }

    @PostMapping("/super-admin/subscriptions/{id}/pay")
    @Operation(summary = "Criar pagamento de assinatura")
    public PaymentResponse createSubscriptionPayment(@PathVariable java.util.UUID id) {
        return mercadoPagoService.createSubscriptionPreference(id);
    }

    @PostMapping("/webhooks/mercadopago/subscriptions")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Webhook Mercado Pago (Assinaturas)")
    public void handleSubscriptionWebhook(@RequestBody WebhookPayload payload) {
        log.info("Recebido webhook MP de assinatura: {}", payload);
        mercadoPagoService.processSubscriptionWebhook(payload);
    }
}
