package com.saas.ecommerce.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.saas.ecommerce.entity.Category;
import com.saas.ecommerce.entity.Product;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Teste de integração para validar o isolamento multi-tenant.
 *
 * Cenário principal: o admin da "FashionStore" NÃO pode ver produtos da
 * "TechStore".
 */
class TenantIsolationIntegrationTest extends AbstractIntegrationTest {

        private Store techStore;
        private Store fashionStore;
        private String techAdminToken;
        private String fashionAdminToken;
        private Product notebook;

        @BeforeEach
        void setUp() {
                cleanDatabase();

                techStore = createStore("TechStore", "tech-store");
                fashionStore = createStore("FashionStore", "fashion-store");

                User techAdmin = createUser("Admin TechStore", "admin@techstore.com",
                                UserRole.ADMIN_LOJA, techStore.getId());
                User fashionAdmin = createUser("Admin FashionStore", "admin@fashionstore.com",
                                UserRole.ADMIN_LOJA, fashionStore.getId());

                techAdminToken = generateToken(techAdmin);
                fashionAdminToken = generateToken(fashionAdmin);

                Category techCategory = createCategory("Notebooks", techStore.getId());

                notebook = productRepository.save(Product.builder()
                                .name("Notebook Gamer")
                                .description("Notebook com RTX 4090")
                                .price(new BigDecimal("12999.90"))
                                .stockQuantity(10)
                                .active(true)
                                .categoryId(techCategory.getId())
                                .storeId(techStore.getId())
                                .build());
        }

        @Nested
        @DisplayName("Isolamento de Tenant - GET /api/admin/products")
        class TenantIsolation {

                @Test
                @DisplayName("Admin da TechStore deve ver apenas seus próprios produtos")
                void techStoreAdmin_shouldSeeOwnProducts() throws Exception {
                        MvcResult result = mockMvc.perform(get("/api/admin/products")
                                        .header("Authorization", "Bearer " + techAdminToken))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.content").isArray())
                                        .andExpect(jsonPath("$.content.length()").value(1))
                                        .andExpect(jsonPath("$.content[0].name").value("Notebook Gamer"))
                                        .andReturn();

                        String responseBody = result.getResponse().getContentAsString();
                        JsonNode page = objectMapper.readTree(responseBody);
                        assertThat(page.get("totalElements").asInt()).isEqualTo(1);
                }

                @Test
                @DisplayName("VIOLAÇÃO DE SEGURANÇA: Admin da FashionStore NÃO pode ver produtos da TechStore")
                void fashionStoreAdmin_shouldNotSeeTechStoreProducts() throws Exception {
                        MvcResult result = mockMvc.perform(get("/api/admin/products")
                                        .header("Authorization", "Bearer " + fashionAdminToken))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.content").isArray())
                                        .andExpect(jsonPath("$.content.length()").value(0))
                                        .andReturn();

                        String responseBody = result.getResponse().getContentAsString();
                        JsonNode page = objectMapper.readTree(responseBody);

                        // Se totalElements > 0, houve VAZAMENTO entre tenants
                        assertThat(page.get("totalElements").asInt())
                                        .as("VAZAMENTO MULTI-TENANT DETECTADO: FashionStore viu produtos da TechStore!")
                                        .isZero();
                }

                @Test
                @DisplayName("Admin da FashionStore NÃO pode buscar produto da TechStore por ID")
                void fashionStoreAdmin_shouldNotFindTechStoreProductById() throws Exception {
                        mockMvc.perform(get("/api/admin/products/{id}", notebook.getId())
                                        .header("Authorization", "Bearer " + fashionAdminToken))
                                        .andExpect(status().isNotFound());
                }
        }

        @Nested
        @DisplayName("Isolamento de Tenant - POST /api/admin/products")
        class TenantIsolationCreate {

                @Test
                @DisplayName("Produto criado pela TechStore deve ter o store_id da TechStore")
                void productCreatedByTechStore_shouldBelongToTechStore() throws Exception {
                        // Criar categoria para a FashionStore
                        Category fashionCategory = categoryRepository.save(Category.builder()
                                        .name("Vestidos")
                                        .storeId(fashionStore.getId())
                                        .build());

                        String requestBody = """
                                        {
                                            "name": "Vestido Floral",
                                            "description": "Vestido de verão",
                                            "price": 199.90,
                                            "stockQuantity": 5,
                                            "categoryId": "%s",
                                            "active": true
                                        }
                                        """.formatted(fashionCategory.getId());

                        MvcResult result = mockMvc.perform(post("/api/admin/products")
                                        .header("Authorization", "Bearer " + fashionAdminToken)
                                        .contentType("application/json")
                                        .content(requestBody))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.name").value("Vestido Floral"))
                                        .andExpect(jsonPath("$.storeId").value(fashionStore.getId().toString()))
                                        .andReturn();

                        // Verificar que o storeId foi injetado corretamente
                        String responseBody = result.getResponse().getContentAsString();
                        JsonNode product = objectMapper.readTree(responseBody);
                        assertThat(product.get("storeId").asText()).isEqualTo(fashionStore.getId().toString());

                        // Admin da TechStore NÃO deve ver o produto criado pela FashionStore
                        mockMvc.perform(get("/api/admin/products")
                                        .header("Authorization", "Bearer " + techAdminToken))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.content.length()").value(1))
                                        .andExpect(jsonPath("$.content[0].name").value("Notebook Gamer"));
                }
        }

        @Nested
        @DisplayName("Segurança - Acesso sem autenticação")
        class SecurityAccess {

                @Test
                @DisplayName("Requisição sem token deve retornar 401")
                void noToken_shouldReturn401() throws Exception {
                        mockMvc.perform(get("/api/admin/products"))
                                        .andExpect(status().isUnauthorized());
                }

                @Test
                @DisplayName("Token inválido deve retornar 401")
                void invalidToken_shouldReturn401() throws Exception {
                        mockMvc.perform(get("/api/admin/products")
                                        .header("Authorization", "Bearer token_invalido_e_malicioso"))
                                        .andExpect(status().isUnauthorized());
                }
        }
}
