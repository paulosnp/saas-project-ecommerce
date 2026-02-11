package com.saas.ecommerce.security;

import com.saas.ecommerce.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtro JWT que intercepta toda requisição, valida o token RSA e:
 * 1. Seta o SecurityContext com o usuário autenticado
 * 2. Seta o TenantContext com o store_id do token (para ADMIN_LOJA)
 *
 * IMPORTANTE: Este filtro é o ÚNICO ponto de limpeza garantido do
 * TenantContext,
 * pois o bloco finally envolve TODA a chain (incluindo Interceptors).
 * O TenantInterceptor.afterCompletion() é uma segunda camada de segurança.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractTokenFromRequest(request);

            if (token != null && tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);
                CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                UUID storeId = tokenProvider.getStoreIdFromToken(token);
                if (storeId != null) {
                    TenantContext.setCurrentTenant(storeId);
                    log.debug("TenantContext setado via JWT: store_id={}", storeId);
                }
            }

            // Fallback: Se não tem tenant no token, tenta header X-Store-ID (Storefront)
            if (TenantContext.getCurrentTenant() == null) {
                String storeHeader = request.getHeader("X-Store-ID");
                if (StringUtils.hasText(storeHeader)) {
                    try {
                        UUID storeId = UUID.fromString(storeHeader);
                        TenantContext.setCurrentTenant(storeId);
                        log.debug("TenantContext setado via Header: store_id={}", storeId);
                    } catch (IllegalArgumentException e) {
                        log.warn("Header X-Store-ID inválido: {}", storeHeader);
                    }
                }
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            if (e instanceof ServletException)
                throw (ServletException) e;
            if (e instanceof IOException)
                throw (IOException) e;
            log.error("Erro ao processar autenticação JWT", e);
            throw new ServletException(e);
        } finally {
            // CRÍTICO: Limpa o ThreadLocal ANTES da thread voltar ao pool.
            // Sem isso, uma thread que atendeu "Loja A" pode vazar dados para "Loja B".
            TenantContext.clear();
            SecurityContextHolder.clearContext();
        }
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
