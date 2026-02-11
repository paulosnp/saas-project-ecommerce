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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de CRUD completo de produtos: criação, leitura, atualização, exclusão,
 * validação de DTOs (campos obrigatórios, negativos) e proteção contra XSS.
 */
class ProductCrudIntegrationTest extends AbstractIntegrationTest {

    private Store store;
    private User admin;
    private String adminToken;
    private Category category;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        store = createStore("CrudTestStore", "crud-test-store");
        admin = createUser("Admin CRUD", "admin@crud.com", UserRole.ADMIN_LOJA, store.getId());
        adminToken = generateToken(admin);
        category = createCategory("Eletrônicos", store.getId());
    }

    private String validProductJson() {
        return """
                {
                    "name": "Monitor 27 polegadas",
                    "description": "Monitor IPS 4K",
                    "price": 2499.90,
                    "stockQuantity": 15,
                    "categoryId": "%s",
                    "active": true
                }
                """.formatted(category.getId());
    }

    @Nested
    @DisplayName("Criação de Produtos - POST /api/admin/products")
    class CreateProduct {

        @Test
        @DisplayName("Criar produto válido retorna 201")
        void validProduct_returns201() throws Exception {
            mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validProductJson()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("Monitor 27 polegadas"))
                    .andExpect(jsonPath("$.price").value(2499.90))
                    .andExpect(jsonPath("$.stockQuantity").value(15))
                    .andExpect(jsonPath("$.storeId").value(store.getId().toString()))
                    .andExpect(jsonPath("$.id").isNotEmpty());
        }

        @Test
        @DisplayName("Criar produto sem nome retorna 400")
        void blankName_returns400() throws Exception {
            String body = """
                    {
                        "name": "",
                        "price": 100,
                        "stockQuantity": 5,
                        "categoryId": "%s"
                    }
                    """.formatted(category.getId());

            mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Criar produto sem preço retorna 400")
        void nullPrice_returns400() throws Exception {
            String body = """
                    {
                        "name": "Sem Preço",
                        "stockQuantity": 5,
                        "categoryId": "%s"
                    }
                    """.formatted(category.getId());

            mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Criar produto com preço negativo retorna 400")
        void negativePrice_returns400() throws Exception {
            String body = """
                    {
                        "name": "Preço Negativo",
                        "price": -10.00,
                        "stockQuantity": 5,
                        "categoryId": "%s"
                    }
                    """.formatted(category.getId());

            mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Criar produto com estoque negativo retorna 400")
        void negativeStock_returns400() throws Exception {
            String body = """
                    {
                        "name": "Estoque Negativo",
                        "price": 100,
                        "stockQuantity": -1,
                        "categoryId": "%s"
                    }
                    """.formatted(category.getId());

            mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Criar produto sem categoria retorna 400")
        void nullCategory_returns400() throws Exception {
            String body = """
                    {
                        "name": "Sem Categoria",
                        "price": 100,
                        "stockQuantity": 5
                    }
                    """;

            mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Atualização e Exclusão - PUT/DELETE /api/admin/products")
    class UpdateAndDelete {

        @Test
        @DisplayName("Atualizar produto existente retorna 200 com dados novos")
        void updateProduct_returns200() throws Exception {
            // Criar produto
            MvcResult createResult = mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validProductJson()))
                    .andExpect(status().isCreated())
                    .andReturn();

            String productId = objectMapper.readTree(
                    createResult.getResponse().getContentAsString()).get("id").asText();

            // Atualizar
            String updateBody = """
                    {
                        "name": "Monitor ATUALIZADO",
                        "description": "Descrição nova",
                        "price": 1999.90,
                        "stockQuantity": 20,
                        "categoryId": "%s",
                        "active": true
                    }
                    """.formatted(category.getId());

            mockMvc.perform(put("/api/admin/products/{id}", productId)
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(updateBody))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Monitor ATUALIZADO"))
                    .andExpect(jsonPath("$.price").value(1999.90))
                    .andExpect(jsonPath("$.stockQuantity").value(20));
        }

        @Test
        @DisplayName("Excluir produto → GET retorna 404")
        void deleteProduct_thenGetReturns404() throws Exception {
            // Criar produto
            MvcResult createResult = mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validProductJson()))
                    .andExpect(status().isCreated())
                    .andReturn();

            String productId = objectMapper.readTree(
                    createResult.getResponse().getContentAsString()).get("id").asText();

            // Excluir
            mockMvc.perform(delete("/api/admin/products/{id}", productId)
                    .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());

            // Verificar que não existe mais
            mockMvc.perform(get("/api/admin/products/{id}", productId)
                    .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Storefront - Produtos públicos")
    class Storefront {

        @Test
        @DisplayName("Storefront mostra apenas produtos ativos")
        void storefrontShowsOnlyActiveProducts() throws Exception {
            // Criar 1 ativo e 1 inativo
            productRepository.save(Product.builder()
                    .name("Produto Ativo")
                    .price(new BigDecimal("100"))
                    .stockQuantity(10)
                    .active(true)
                    .categoryId(category.getId())
                    .storeId(store.getId())
                    .build());

            productRepository.save(Product.builder()
                    .name("Produto Inativo")
                    .price(new BigDecimal("200"))
                    .stockQuantity(5)
                    .active(false)
                    .categoryId(category.getId())
                    .storeId(store.getId())
                    .build());

            mockMvc.perform(get("/api/storefront/products")
                    .header("X-Store-ID", store.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(1))
                    .andExpect(jsonPath("$.content[0].name").value("Produto Ativo"));
        }
    }

    @Nested
    @DisplayName("Segurança - Input Sanitization")
    class InputSanitization {

        @Test
        @DisplayName("Nome com tags HTML/XSS é armazenado como texto puro, sem execução")
        void xssInProductName_isStoredAsPlainText() throws Exception {
            String xssPayload = "<script>alert('XSS')</script>Produto Malicioso";
            String body = """
                    {
                        "name": "%s",
                        "description": "<img onerror=alert(1) src=x>",
                        "price": 100,
                        "stockQuantity": 5,
                        "categoryId": "%s",
                        "active": true
                    }
                    """.formatted(xssPayload, category.getId());

            MvcResult result = mockMvc.perform(post("/api/admin/products")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isCreated())
                    .andReturn();

            // O nome é armazenado como texto puro (não interpretado como HTML)
            JsonNode product = objectMapper.readTree(result.getResponse().getContentAsString());
            assertThat(product.get("name").asText()).contains("<script>");
            assertThat(product.get("description").asText()).contains("<img");
        }
    }
}
