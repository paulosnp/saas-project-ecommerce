package com.saas.ecommerce.integration;

import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de autorização por ROLE.
 *
 * Regras do SecurityConfig:
 * /api/auth/** → permitAll
 * /api/storefront/** → permitAll
 * /api/super-admin/** → SUPER_ADMIN
 * /api/admin/** → ADMIN_LOJA
 */
class AuthorizationIntegrationTest extends AbstractIntegrationTest {

    private String clienteToken;
    private String adminLojaToken;
    private String superAdminToken;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        Store store = createStore("AuthTestStore", "auth-test-store");

        User cliente = createUser("Cliente Teste", "cliente@test.com", UserRole.CLIENTE, null);
        User adminLoja = createUser("Admin Teste", "admin@test.com", UserRole.ADMIN_LOJA, store.getId());
        User superAdmin = createUser("Super Admin", "super@test.com", UserRole.SUPER_ADMIN, null);

        clienteToken = generateToken(cliente);
        adminLojaToken = generateToken(adminLoja);
        superAdminToken = generateToken(superAdmin);
    }

    @Nested
    @DisplayName("Rotas públicas - Sem autenticação necessária")
    class PublicRoutes {

        @Test
        @DisplayName("Qualquer um pode acessar /api/auth/login")
        void auth_isPublic() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType("application/json")
                    .content("{\"email\":\"x@x.com\",\"password\":\"123\"}"))
                    .andExpect(status().isUnauthorized()); // 401 = auth failed, not 403
        }

        @Test
        @DisplayName("Qualquer um pode acessar /api/storefront/products")
        void storefront_isPublic() throws Exception {
            mockMvc.perform(get("/api/storefront/products")
                    .header("X-Store-ID", "00000000-0000-0000-0000-000000000001"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Rotas /api/admin/** - Apenas ADMIN_LOJA")
    class AdminRoutes {

        @Test
        @DisplayName("Sem token → 401")
        void noToken_returns401() throws Exception {
            mockMvc.perform(get("/api/admin/products"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("CLIENTE → 403 Forbidden")
        void cliente_returns403() throws Exception {
            mockMvc.perform(get("/api/admin/products")
                    .header("Authorization", "Bearer " + clienteToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("SUPER_ADMIN → 403 (não é ADMIN_LOJA)")
        void superAdmin_returns403() throws Exception {
            mockMvc.perform(get("/api/admin/products")
                    .header("Authorization", "Bearer " + superAdminToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("ADMIN_LOJA → 200 OK")
        void adminLoja_returns200() throws Exception {
            mockMvc.perform(get("/api/admin/products")
                    .header("Authorization", "Bearer " + adminLojaToken))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Rotas /api/super-admin/** - Apenas SUPER_ADMIN")
    class SuperAdminRoutes {

        @Test
        @DisplayName("Sem token → 401")
        void noToken_returns401() throws Exception {
            mockMvc.perform(get("/api/super-admin/stores"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("CLIENTE → 403")
        void cliente_returns403() throws Exception {
            mockMvc.perform(get("/api/super-admin/stores")
                    .header("Authorization", "Bearer " + clienteToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("ADMIN_LOJA → 403")
        void adminLoja_returns403() throws Exception {
            mockMvc.perform(get("/api/super-admin/stores")
                    .header("Authorization", "Bearer " + adminLojaToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("SUPER_ADMIN → 200 OK")
        void superAdmin_returns200() throws Exception {
            mockMvc.perform(get("/api/super-admin/stores")
                    .header("Authorization", "Bearer " + superAdminToken))
                    .andExpect(status().isOk());
        }
    }
}
