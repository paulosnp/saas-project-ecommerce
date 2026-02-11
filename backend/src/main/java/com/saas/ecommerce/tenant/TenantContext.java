package com.saas.ecommerce.tenant;

import java.util.UUID;

/**
 * ThreadLocal holder para o tenant (store_id) da requisição atual.
 * Setado pelo JwtAuthenticationFilter (rotas autenticadas) ou
 * pelo TenantInterceptor (rotas públicas da storefront).
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setCurrentTenant(UUID tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static UUID getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static UUID requireCurrentTenant() {
        UUID tenant = CURRENT_TENANT.get();
        if (tenant == null) {
            throw new IllegalStateException("Nenhum tenant definido no contexto atual.");
        }
        return tenant;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
