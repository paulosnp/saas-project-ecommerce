package com.saas.ecommerce.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler global de exceções — retorna RFC 7807 (ProblemDetail) para todas as
 * respostas de erro.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Erro de Validação");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/validation"));

        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        problem.setProperty("errors", errors);

        return problem;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Recurso Não Encontrado");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/not-found"));
        return problem;
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ProblemDetail handleDuplicate(DuplicateResourceException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Recurso Duplicado");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/conflict"));
        return problem;
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ProblemDetail handleInsufficientStock(InsufficientStockException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Estoque Insuficiente");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/conflict"));
        return problem;
    }

    @ExceptionHandler(TenantViolationException.class)
    public ProblemDetail handleTenantViolation(TenantViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
        problem.setTitle("Violação de Tenant");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/tenant-violation"));
        return problem;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Requisição Inválida");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/bad-request"));
        return problem;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalState(IllegalStateException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Operação Não Permitida");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/bad-request"));
        return problem;
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ProblemDetail handleAuthentication(org.springframework.security.core.AuthenticationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED,
                "Falha na autenticação: " + ex.getMessage());
        problem.setTitle("Não Autorizado");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/unauthorized"));
        return problem;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN, "Você não tem permissão para acessar este recurso.");
        problem.setTitle("Acesso Negado");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/forbidden"));
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        log.error("Erro interno não tratado", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro interno. Tente novamente.");
        problem.setTitle("Erro Interno");
        problem.setType(URI.create("https://api.saas-ecommerce.com/errors/internal"));
        return problem;
    }
}
