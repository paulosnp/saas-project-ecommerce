package com.saas.ecommerce.integration.mercadopago;

import com.saas.ecommerce.service.PlatformSettingsService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import com.saas.ecommerce.dto.payment.PaymentResponse;
import com.saas.ecommerce.dto.payment.WebhookPayload;
import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.entity.OrderItem;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.enums.OrderStatus;
import com.saas.ecommerce.repository.OrderRepository;
import com.saas.ecommerce.repository.ProductRepository;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MercadoPagoService {

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final PlatformSettingsService platformSettingsService;

    @Value("${integration.mercado-pago.notification-base-url}")
    private String notificationBaseUrl;

    @Value("${integration.mercado-pago.back-url-success}")
    private String backUrlSuccess;

    @Value("${integration.mercado-pago.back-url-failure}")
    private String backUrlFailure;

    @Value("${integration.mercado-pago.back-url-pending}")
    private String backUrlPending;

    @Value("${integration.mercado-pago.platform-access-token:}")
    private String platformAccessTokenFallback;

    /**
     * Gets the platform access token: first from DB, then from properties as
     * fallback.
     */
    private String getPlatformAccessToken() {
        String dbToken = platformSettingsService.getMercadoPagoAccessToken();
        if (dbToken != null && !dbToken.isBlank()) {
            return dbToken;
        }
        return platformAccessTokenFallback;
    }

    @Transactional
    public PaymentResponse createOrderPreference(UUID orderId) {
        UUID storeId = TenantContext.requireCurrentTenant();

        Order order = orderRepository.findByIdAndStoreId(orderId, storeId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Pedido não está pendente de pagamento");
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalStateException("Loja não encontrada"));

        String token = store.getMercadoPagoToken();
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Loja não possui token do Mercado Pago configurado");
        }

        // Configure SDK with store token
        MercadoPagoConfig.setAccessToken(token);

        List<PreferenceItemRequest> items = new ArrayList<>();
        for (OrderItem orderItem : order.getItems()) {
            items.add(PreferenceItemRequest.builder()
                    .title(orderItem.getProduct().getName())
                    .quantity(orderItem.getQuantity())
                    .unitPrice(orderItem.getUnitPrice())
                    .currencyId("BRL")
                    .build());
        }

        // Add shipping if applicable
        if (order.getShippingCost() != null && order.getShippingCost().compareTo(BigDecimal.ZERO) > 0) {
            items.add(PreferenceItemRequest.builder()
                    .title("Frete")
                    .quantity(1)
                    .unitPrice(order.getShippingCost())
                    .currencyId("BRL")
                    .build());
        }

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(backUrlSuccess)
                .failure(backUrlFailure)
                .pending(backUrlPending)
                .build();

        String notificationUrl = String.format("%s/api/webhooks/mercadopago/orders?storeId=%s", notificationBaseUrl,
                storeId);

        PreferenceRequest request = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved")
                .notificationUrl(notificationUrl)
                .externalReference(orderId.toString())
                .build();

        try {
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(request);

            order.setStatus(OrderStatus.AWAITING_PAYMENT);
            orderRepository.save(order);

            return new PaymentResponse(preference.getInitPoint(), preference.getId());
        } catch (Exception e) {
            log.error("Erro ao criar preferência no Mercado Pago", e);
            throw new RuntimeException("Erro ao criar pagamento", e);
        }
    }

    @Transactional
    public void processOrderWebhook(WebhookPayload payload, String storeIdStr) {
        if (!"payment".equals(payload.getType())) {
            return;
        }

        UUID storeId = UUID.fromString(storeIdStr);
        String paymentId = payload.getData().getId();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada: " + storeId));

        String token = store.getMercadoPagoToken();
        if (token == null || token.isBlank()) {
            log.error("Webhook recebido para loja sem token MP: {}", storeId);
            return;
        }

        // Must verify payment status with MP API
        MercadoPagoConfig.setAccessToken(token);

        try {
            com.mercadopago.client.payment.PaymentClient client = new com.mercadopago.client.payment.PaymentClient();
            com.mercadopago.resources.payment.Payment payment = client.get(Long.valueOf(paymentId));

            String externalRef = payment.getExternalReference();
            if (externalRef == null)
                return;

            UUID orderId = UUID.fromString(externalRef);
            Order order = orderRepository.findById(orderId).orElse(null);

            if (order == null) {
                log.warn("Pedido não encontrado para webhook: {}", orderId);
                return;
            }

            // Idempotency check
            if (order.getStatus() == OrderStatus.PAYMENT_CONFIRMED ||
                    order.getStatus() == OrderStatus.PROCESSING ||
                    order.getStatus() == OrderStatus.SHIPPED ||
                    order.getStatus() == OrderStatus.DELIVERED) {
                return;
            }

            String status = payment.getStatus();
            if ("approved".equals(status)) {
                order.setStatus(OrderStatus.PAYMENT_CONFIRMED);
                orderRepository.save(order);
                log.info("Pagamento confirmado para pedido {}", orderId);
            } else if ("refunded".equals(status) || "charged_back".equals(status)) {
                order.setStatus(OrderStatus.REFUNDED);
                restoreStock(order);
                orderRepository.save(order);
                log.info("Pagamento reembolsado para pedido {}", orderId);
            }

        } catch (Exception e) {
            log.error("Erro ao processar webhook MP", e);
            throw new RuntimeException("Erro ao processar webhook", e);
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            var product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }

    @Transactional
    public PaymentResponse createSubscriptionPreference(UUID subscriptionId) {
        // Implementation for subscription payment using platform token
        // Typically involves creating a Preapproval (Subscription) in MP
        // For simplicity in this phase, we'll treat it as a Checkout Preference for the
        // plan value

        MercadoPagoConfig.setAccessToken(getPlatformAccessToken());

        // Fetch subscription and plan logic here (omitted for brevity, requires
        // SubscriptionRepository)
        // ...

        return new PaymentResponse("https://www.mercadopago.com.br/subscription-checkout", "sub_pref_id");
    }

    @Transactional
    public void processSubscriptionWebhook(WebhookPayload payload) {
        // Verify with platform token
        MercadoPagoConfig.setAccessToken(getPlatformAccessToken());

        // Logic to update Subscription status based on payment
        log.info("Processando webhook de assinatura: {}", payload.getId());
    }
}
