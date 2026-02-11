package com.saas.ecommerce.tenant;

import com.saas.ecommerce.exception.TenantViolationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * Interceptor para rotas públicas da storefront (/api/storefront/**).
 * Identifica a loja pelo header X-Store-ID ou pelo subdomínio.
 *
 * O TenantContext já pode ter sido setado pelo JwtAuthenticationFilter
 * (caso o usuário esteja autenticado), então verificamos isso primeiro.
 *
 * A limpeza PRINCIPAL do TenantContext é feita pelo JwtAuthenticationFilter
 * (que envolve toda a chain num try/finally). O afterCompletion é uma
 * segunda camada de segurança por boa prática.
 */
@Slf4j
@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String STORE_ID_HEADER = "X-Store-ID";

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) {
        // Se o JwtAuthenticationFilter já setou o tenant (usuário autenticado), não
        // sobrescreve
        if (TenantContext.getCurrentTenant() != null) {
            return true;
        }

        String storeIdHeader = request.getHeader(STORE_ID_HEADER);

        if (storeIdHeader != null && !storeIdHeader.isBlank()) {
            try {
                UUID storeId = UUID.fromString(storeIdHeader.trim());
                TenantContext.setCurrentTenant(storeId);
                log.debug("Tenant resolvido via header X-Store-ID: {}", storeId);
                return true;
            } catch (IllegalArgumentException e) {
                throw new TenantViolationException("Header X-Store-ID inválido: " + storeIdHeader);
            }
        }

        // Tenta resolver pelo subdomínio: {slug}.dominio.com
        String host = request.getServerName();
        if (host != null && host.contains(".")) {
            String subdomain = host.split("\\.")[0];
            if (!subdomain.equals("www") && !subdomain.equals("api")) {
                log.debug("Subdomínio detectado: {}. Resolução de tenant será feita pelo controller.", subdomain);
                request.setAttribute("tenant_slug", subdomain);
                return true;
            }
        }

        throw new TenantViolationException(
                "Identificação da loja obrigatória. Envie o header X-Store-ID ou acesse via subdomínio.");
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler,
            @Nullable Exception ex) {
        // Segunda camada de limpeza (a principal está no JwtAuthenticationFilter)
        TenantContext.clear();
    }
}
