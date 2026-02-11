package com.saas.ecommerce.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saas.ecommerce.config.TestRsaKeyConfig;
import com.saas.ecommerce.entity.Category;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.repository.OrderRepository;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import com.saas.ecommerce.repository.CategoryRepository;
import com.saas.ecommerce.repository.ProductRepository;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.repository.UserRepository;
import com.saas.ecommerce.security.CustomUserDetails;
import com.saas.ecommerce.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

/**
 * Base para todos os testes de integração.
 * Fornece Testcontainers PostgreSQL, MockMvc e helpers de criação de dados.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestRsaKeyConfig.class)
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        postgres.start();
    }

    @org.springframework.test.context.DynamicPropertySource
    static void configureProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    protected MockMvc mockMvc;
    @Autowired
    protected ObjectMapper objectMapper;
    @Autowired
    protected StoreRepository storeRepository;
    @Autowired
    protected UserRepository userRepository;
    @Autowired
    protected CategoryRepository categoryRepository;
    @Autowired
    protected ProductRepository productRepository;
    @Autowired
    protected OrderRepository orderRepository;
    @Autowired
    protected JwtTokenProvider tokenProvider;
    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected Store createStore(String name, String slug) {
        return storeRepository.save(Store.builder()
                .name(name)
                .slugUrl(slug)
                .active(true)
                .build());
    }

    protected User createUser(String fullName, String email, UserRole role, UUID storeId) {
        return userRepository.save(User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode("SenhaForte123!"))
                .role(role)
                .storeId(storeId)
                .build());
    }

    protected Category createCategory(String name, UUID storeId) {
        return categoryRepository.save(Category.builder()
                .name(name)
                .storeId(storeId)
                .build());
    }

    protected String generateToken(User user) {
        return tokenProvider.generateToken(new CustomUserDetails(
                user.getId(), user.getEmail(), user.getPassword(),
                user.getRole(), user.getStoreId()));
    }

    protected void cleanDatabase() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        storeRepository.deleteAll();
    }
}
