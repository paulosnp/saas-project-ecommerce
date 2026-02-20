package com.saas.ecommerce.dto.customer;

import com.saas.ecommerce.dto.order.OrderItemResponse;
import com.saas.ecommerce.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CustomerOrderResponse(
        UUID orderId,
        OrderStatus status,
        BigDecimal total,
        LocalDateTime createdAt,
        List<OrderItemResponse> items) {
}
