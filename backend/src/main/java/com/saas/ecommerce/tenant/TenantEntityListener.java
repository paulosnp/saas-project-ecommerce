package com.saas.ecommerce.tenant;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.util.UUID;

/**
 * EntityListener que injeta automaticamente o store_id do TenantContext
 * em entidades durante @PrePersist e @PreUpdate.
 */
@Slf4j
public class TenantEntityListener {

    @PrePersist
    public void setTenantOnCreate(Object entity) {
        setStoreId(entity);
    }

    @PreUpdate
    public void setTenantOnUpdate(Object entity) {
        setStoreId(entity);
    }

    private void setStoreId(Object entity) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return;
        }

        try {
            Field field = findField(entity.getClass(), "storeId");
            if (field != null) {
                field.setAccessible(true);
                if (field.get(entity) == null) {
                    field.set(entity, tenantId);
                    log.debug("store_id={} injetado em {}", tenantId, entity.getClass().getSimpleName());
                }
            }
        } catch (IllegalAccessException e) {
            log.error("Erro ao injetar store_id na entidade {}", entity.getClass().getSimpleName(), e);
        }
    }

    private Field findField(Class<?> clazz, String fieldName) {
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        return null;
    }
}
