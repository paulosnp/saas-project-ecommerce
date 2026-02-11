package com.saas.ecommerce.entity;

import com.saas.ecommerce.audit.BaseEntity;
import com.saas.ecommerce.tenant.TenantEntityListener;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Filter(name = "tenantFilter", condition = "store_id = :storeId")
@EntityListeners(TenantEntityListener.class)
public class Product extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "weight_kg", precision = 8, scale = 3)
    private BigDecimal weightKg;

    @Column(name = "height_cm", precision = 8, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "width_cm", precision = 8, scale = 2)
    private BigDecimal widthCm;

    @Column(name = "length_cm", precision = 8, scale = 2)
    private BigDecimal lengthCm;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", insertable = false, updatable = false)
    private Store store;
}
