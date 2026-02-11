package com.saas.ecommerce.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes do fluxo completo de autenticação: registro, login e validação de
 * DTOs.
 */
class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @Nested
    @DisplayName("Registro de Lojista - POST /api/auth/register/store")
    class RegisterStoreOwner {

        @Test
        @DisplayName("Registro válido retorna 201 + JWT + role ADMIN_LOJA")
        void validRegistration_returns201WithJwt() throws Exception {
            String body = """
                    {
                        "fullName": "João Silva",
                        "email": "joao@loja.com",
                        "password": "SenhaForte123!",
                        "storeName": "Loja do João",
                        "storeSlug": "loja-joao"
                    }
                    """;

            MvcResult result = mockMvc.perform(post("/api/auth/register/store")
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.role").value("ADMIN_LOJA"))
                    .andExpect(jsonPath("$.email").value("joao@loja.com"))
                    .andExpect(jsonPath("$.storeId").isNotEmpty())
                    .andReturn();

            JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
            assertThat(response.get("fullName").asText()).isEqualTo("João Silva");
        }

        @Test
        @DisplayName("Email duplicado retorna erro")
        void duplicateEmail_returnsError() throws Exception {
            String body = """
                    {
                        "fullName": "Primeiro",
                        "email": "duplicado@test.com",
                        "password": "SenhaForte123!",
                        "storeName": "Loja 1",
                        "storeSlug": "loja-1"
                    }
                    """;

            // Primeiro registro
            mockMvc.perform(post("/api/auth/register/store")
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isCreated());

            // Segundo registro com mesmo email
            String body2 = """
                    {
                        "fullName": "Segundo",
                        "email": "duplicado@test.com",
                        "password": "SenhaForte123!",
                        "storeName": "Loja 2",
                        "storeSlug": "loja-2"
                    }
                    """;

            mockMvc.perform(post("/api/auth/register/store")
                    .contentType("application/json")
                    .content(body2))
                    .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("Registro de Cliente - POST /api/auth/register/customer")
    class RegisterCustomer {

        @Test
        @DisplayName("Registro válido retorna 201 + JWT + role CLIENTE")
        void validRegistration_returns201WithJwt() throws Exception {
            String body = """
                    {
                        "fullName": "Maria Souza",
                        "email": "maria@cliente.com",
                        "password": "SenhaForte123!"
                    }
                    """;

            mockMvc.perform(post("/api/auth/register/customer")
                    .contentType("application/json")
                    .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.role").value("CLIENTE"))
                    .andExpect(jsonPath("$.email").value("maria@cliente.com"));
        }
    }

    @Nested
    @DisplayName("Login - POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("Login com credenciais válidas retorna 200 + JWT")
        void validCredentials_returns200() throws Exception {
            // Registrar primeiro
            mockMvc.perform(post("/api/auth/register/customer")
                    .contentType("application/json")
                    .content("""
                            {
                                "fullName": "Login Teste",
                                "email": "login@test.com",
                                "password": "SenhaForte123!"
                            }
                            """))
                    .andExpect(status().isCreated());

            // Agora fazer login
            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                                "email": "login@test.com",
                                "password": "SenhaForte123!"
                            }
                            """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.role").value("CLIENTE"));
        }

        @Test
        @DisplayName("Login com senha errada retorna 401")
        void wrongPassword_returns401() throws Exception {
            // Registrar
            mockMvc.perform(post("/api/auth/register/customer")
                    .contentType("application/json")
                    .content("""
                            {
                                "fullName": "Wrong Pass",
                                "email": "wrong@test.com",
                                "password": "SenhaForte123!"
                            }
                            """))
                    .andExpect(status().isCreated());

            // Login com senha errada
            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                                "email": "wrong@test.com",
                                "password": "SenhaErrada!"
                            }
                            """))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Login com email inexistente retorna 401")
        void nonExistentEmail_returns401() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                                "email": "naoexiste@test.com",
                                "password": "SenhaForte123!"
                            }
                            """))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Validação de DTOs - campos obrigatórios")
    class DtoValidation {

        @Test
        @DisplayName("Registro com nome em branco retorna 400")
        void blankName_returns400() throws Exception {
            mockMvc.perform(post("/api/auth/register/customer")
                    .contentType("application/json")
                    .content("""
                            {
                                "fullName": "",
                                "email": "val1@test.com",
                                "password": "SenhaForte123!"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Registro com email inválido retorna 400")
        void invalidEmail_returns400() throws Exception {
            mockMvc.perform(post("/api/auth/register/customer")
                    .contentType("application/json")
                    .content("""
                            {
                                "fullName": "Teste Validação",
                                "email": "email-invalido",
                                "password": "SenhaForte123!"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Registro com senha menor que 8 caracteres retorna 400")
        void shortPassword_returns400() throws Exception {
            mockMvc.perform(post("/api/auth/register/customer")
                    .contentType("application/json")
                    .content("""
                            {
                                "fullName": "Teste Senha Curta",
                                "email": "val2@test.com",
                                "password": "1234567"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Login com campos vazios retorna 400")
        void emptyLogin_returns400() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                                "email": "",
                                "password": ""
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }
    }
}
