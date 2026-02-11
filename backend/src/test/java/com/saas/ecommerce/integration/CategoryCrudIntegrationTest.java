package com.saas.ecommerce.integration;

import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de CRUD completo de categorias: criação, leitura, atualização,
 * exclusão,
 * validação de DTOs e proteção contra nomes duplicados na mesma loja.
 */
class CategoryCrudIntegrationTest extends AbstractIntegrationTest {

    private Store store;
    private User admin;
    private String adminToken;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        store = createStore("CatTestStore", "cat-test-store");
        admin = createUser("Admin Categoria", "admin@cat.com", UserRole.ADMIN_LOJA, store.getId());
        adminToken = generateToken(admin);
    }

    private String validCategoryJson(String name) {
        return """
                {
                    "name": "%s"
                }
                """.formatted(name);
    }

    @Nested
    @DisplayName("Criação de Categorias - POST /api/admin/categories")
    class CreateCategory {

        @Test
        @DisplayName("Criar categoria válida retorna 201")
        void validCategory_returns201() throws Exception {
            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Eletrônicos")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("Eletrônicos"))
                    .andExpect(jsonPath("$.storeId").value(store.getId().toString()))
                    .andExpect(jsonPath("$.id").isNotEmpty());
        }

        @Test
        @DisplayName("Criar categoria sem nome retorna 400")
        void blankName_returns400() throws Exception {
            String body = """
                    {
                        "name": ""
                    }
                    """;

            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Criar categoria com nome duplicado retorna 409")
        void duplicateName_returns409() throws Exception {
            // Criar primeira categoria
            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Roupas")))
                    .andExpect(status().isCreated());

            // Tentar criar com mesmo nome
            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Roupas")))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Criar categoria com nome duplicado case-insensitive retorna 409")
        void duplicateNameCaseInsensitive_returns409() throws Exception {
            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Eletrônicos")))
                    .andExpect(status().isCreated());

            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("ELETRÔNICOS")))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("Atualização e Exclusão - PUT/DELETE /api/admin/categories")
    class UpdateAndDelete {

        @Test
        @DisplayName("Atualizar categoria existente retorna 200 com dados novos")
        void updateCategory_returns200() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Roupas")))
                    .andExpect(status().isCreated())
                    .andReturn();

            String categoryId = objectMapper.readTree(
                    createResult.getResponse().getContentAsString()).get("id").asText();

            mockMvc.perform(put("/api/admin/categories/{id}", categoryId)
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Vestuário")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Vestuário"));
        }

        @Test
        @DisplayName("Atualizar categoria mantendo mesmo nome retorna 200")
        void updateCategorySameName_returns200() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Roupas")))
                    .andExpect(status().isCreated())
                    .andReturn();

            String categoryId = objectMapper.readTree(
                    createResult.getResponse().getContentAsString()).get("id").asText();

            // Atualizar com mesmo nome não deve dar conflito
            mockMvc.perform(put("/api/admin/categories/{id}", categoryId)
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Roupas")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Roupas"));
        }

        @Test
        @DisplayName("Excluir categoria → GET retorna 404")
        void deleteCategory_thenGetReturns404() throws Exception {
            MvcResult createResult = mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Temporária")))
                    .andExpect(status().isCreated())
                    .andReturn();

            String categoryId = objectMapper.readTree(
                    createResult.getResponse().getContentAsString()).get("id").asText();

            mockMvc.perform(delete("/api/admin/categories/{id}", categoryId)
                    .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/admin/categories/{id}", categoryId)
                    .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Storefront - Categorias públicas")
    class Storefront {

        @Test
        @DisplayName("Storefront lista categorias da loja correta")
        void storefrontListsCategoriesForStore() throws Exception {
            // Criar categorias via admin
            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Eletrônicos")))
                    .andExpect(status().isCreated());

            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Roupas")))
                    .andExpect(status().isCreated());

            // Storefront deve retornar as 2 categorias
            mockMvc.perform(get("/api/storefront/categories")
                    .header("X-Store-ID", store.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @DisplayName("Storefront de outra loja não vê categorias desta loja")
        void storefrontIsolation() throws Exception {
            // Criar categoria na loja 1
            mockMvc.perform(post("/api/admin/categories")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType("application/json")
                    .content(validCategoryJson("Eletrônicos")))
                    .andExpect(status().isCreated());

            // Criar loja 2
            Store store2 = createStore("OutraLoja", "outra-loja");

            // Storefront da loja 2 não deve ver a categoria da loja 1
            mockMvc.perform(get("/api/storefront/categories")
                    .header("X-Store-ID", store2.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }
}
