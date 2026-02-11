package com.saas.ecommerce.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT", description = "Token JWT obtido via /api/auth/login")
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SaaS E-commerce API")
                        .version("1.0.0")
                        .description("""
                                API REST Multi-tenant para plataforma SaaS de E-commerce.

                                **Papéis:**
                                - `SUPER_ADMIN` — Dono da plataforma (gerencia lojas e assinaturas)
                                - `ADMIN_LOJA` — Lojista (gerencia produtos, categorias e pedidos)
                                - `CLIENTE` — Comprador (navega lojas e faz pedidos)

                                **Multi-tenancy:** Rotas admin usam store_id do JWT.
                                Rotas storefront usam header `X-Store-ID`.
                                """)
                        .contact(new Contact()
                                .name("SaaS Ecommerce")
                                .email("contato@saas-ecommerce.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local")));
    }
}
