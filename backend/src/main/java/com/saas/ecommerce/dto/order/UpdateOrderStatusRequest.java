package com.saas.ecommerce.dto.order;

import com.saas.ecommerce.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Novo status é obrigatório") OrderStatus newStatus,

        String trackingCode) {
}
