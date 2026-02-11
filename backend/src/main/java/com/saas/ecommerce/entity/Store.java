package com.saas.ecommerce.entity;

import com.saas.ecommerce.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Store extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "slug_url", nullable = false, unique = true, length = 100)
    private String slugUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "logo_url")
    private String logoUrl;

    @Builder.Default
    @Column(name = "primary_color", length = 7)
    private String primaryColor = "#000000";

    @Column(name = "mercado_pago_token")
    private String mercadoPagoToken;

    @Column(name = "melhor_envio_token")
    private String melhorEnvioToken;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
