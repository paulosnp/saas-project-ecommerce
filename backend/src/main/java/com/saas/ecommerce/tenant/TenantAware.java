package com.saas.ecommerce.tenant;

import java.lang.annotation.*;

/**
 * Marca um Service/método para ativação automática do Hibernate Filter
 * de multi-tenancy. O TenantFilterAspect intercepta chamadas anotadas
 * e ativa o filtro "tenantFilter" na Session com o store_id do TenantContext.
 */
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface TenantAware {
}
