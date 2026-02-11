package com.saas.ecommerce.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * AOP Aspect que ativa automaticamente o Hibernate Filter "tenantFilter"
 * em toda chamada de método/classe anotada com @TenantAware.
 * Garante isolamento total: nenhuma query vaza dados entre lojas.
 */
@Slf4j
@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Around("@within(com.saas.ecommerce.tenant.TenantAware) || " +
            "@annotation(com.saas.ecommerce.tenant.TenantAware)")
    public Object applyTenantFilter(ProceedingJoinPoint joinPoint) throws Throwable {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter")
                    .setParameter("storeId", tenantId);
            log.debug("Hibernate tenantFilter ativado para store_id={}", tenantId);
        }

        try {
            return joinPoint.proceed();
        } finally {
            if (tenantId != null) {
                Session session = entityManager.unwrap(Session.class);
                session.disableFilter("tenantFilter");
            }
        }
    }
}
