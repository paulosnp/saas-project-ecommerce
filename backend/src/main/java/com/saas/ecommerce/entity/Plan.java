package com.saas.ecommerce.entity;

import com.saas.ecommerce.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Plan extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "max_products", nullable = false)
    private Integer maxProducts = 50;

    @Builder.Default
    @Column(name = "max_orders_month", nullable = false)
    private Integer maxOrdersMonth = 100;

    @Builder.Default
    @Column(columnDefinition = "jsonb")
    private String features = "{}";

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
