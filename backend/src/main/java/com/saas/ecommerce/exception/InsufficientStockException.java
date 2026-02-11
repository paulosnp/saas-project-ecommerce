package com.saas.ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String productName, Integer available, Integer requested) {
        super(String.format("Estoque insuficiente para o produto '%s'. Disponível: %d, Solicitado: %d",
                productName, available, requested));
    }
}
