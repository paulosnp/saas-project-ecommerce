package com.saas.ecommerce.entity;

import com.saas.ecommerce.audit.BaseEntity;
import com.saas.ecommerce.tenant.TenantEntityListener;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Filter;

import java.util.UUID;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Filter(name = "tenantFilter", condition = "store_id = :storeId")
@EntityListeners(TenantEntityListener.class)
public class Category extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", insertable = false, updatable = false)
    private Store store;
}
