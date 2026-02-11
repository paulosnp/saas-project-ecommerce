package com.saas.ecommerce.integration;

import com.saas.ecommerce.dto.address.AddressRequest;
import com.saas.ecommerce.dto.address.AddressResponse;
import com.saas.ecommerce.dto.order.*;
import com.saas.ecommerce.dto.product.ProductRequest;
import com.saas.ecommerce.dto.product.ProductResponse;
import com.saas.ecommerce.entity.Category;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.OrderStatus;
import com.saas.ecommerce.enums.UserRole;
import com.saas.ecommerce.repository.AddressRepository;
import com.saas.ecommerce.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderLifecycleIntegrationTest extends AbstractIntegrationTest {

        @Autowired
        private OrderRepository orderRepository;
        @Autowired
        private AddressRepository addressRepository;

        private Store store;
        private User admin;
        private String adminToken;
        private User customer;
        private String customerToken;
        private UUID addressId;
        private UUID productId;

        @BeforeEach
        void setUp() throws Exception {
                cleanDatabase();

                // 1. Setup Store & Admin
                store = createStore("OrderTestStore", "order-test-store");
                admin = createUser("Admin Order", "admin@order.com", UserRole.ADMIN_LOJA, store.getId());
                adminToken = generateToken(admin);

                // 2. Setup Category & Product (using DTOs/API for Product to ensure full
                // validation or Helpers if available)
                Category category = createCategory("Eletrônicos", store.getId());

                ProductRequest prodReq = new ProductRequest(
                                "Smartphone", // name
                                "Best phone", // description
                                new BigDecimal("1000.00"), // price
                                10, // stockQuantity
                                "http://example.com/image.jpg", // imageUrl
                                new BigDecimal("0.5"), // weightKg
                                new BigDecimal("10"), // heightCm
                                new BigDecimal("5"), // widthCm
                                new BigDecimal("20"), // lengthCm
                                category.getId(), // categoryId
                                true // active
                );

                String prodJson = mockMvc.perform(post("/api/admin/products")
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(prodReq)))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString();
                ProductResponse product = objectMapper.readValue(prodJson, ProductResponse.class);
                productId = product.id();

                // 3. Setup Customer
                customer = createUser("Customer Order", "customer.order@test.com", UserRole.CLIENTE, null);
                customerToken = generateToken(customer);

                // 4. Create Address
                AddressRequest addrReq = new AddressRequest(
                                "Rua Teste", "123", "Apto 101", "Centro", "São Paulo", "SP", "01001-000", true);
                String addrJson = mockMvc.perform(post("/api/customer/addresses")
                                .header("Authorization", "Bearer " + customerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(addrReq)))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString();
                AddressResponse address = objectMapper.readValue(addrJson, AddressResponse.class);
                addressId = address.id();
        }

        @Test
        @DisplayName("Should create order, validate stock, and update status")
        void testOrderLifecycle() throws Exception {
                // 1. Create Order (Customer)
                CreateOrderRequest orderReq = new CreateOrderRequest(
                                List.of(new OrderItemRequest(productId, 2)),
                                addressId,
                                new BigDecimal("20.00"));

                String orderJson = mockMvc.perform(post("/api/storefront/orders")
                                .header("Authorization", "Bearer " + customerToken)
                                .header("X-Store-ID", store.getId().toString()) // Critical for Storefront isolation
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(orderReq)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.items[0].quantity", is(2)))
                                .andExpect(jsonPath("$.total", is(2020.00)))
                                .andReturn().getResponse().getContentAsString();

                OrderResponse order = objectMapper.readValue(orderJson, OrderResponse.class);

                // 2. Update Status (Admin) -> SHIPPED
                UpdateOrderStatusRequest updateReq = new UpdateOrderStatusRequest(
                                OrderStatus.SHIPPED, "TRACK123");

                mockMvc.perform(put("/api/admin/orders/" + order.id() + "/status")
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status", is("SHIPPED")))
                                .andExpect(jsonPath("$.trackingCode", is("TRACK123")));

                // 3. Cancel Order (Admin) -> Stock should restore
                UpdateOrderStatusRequest cancelReq = new UpdateOrderStatusRequest(
                                OrderStatus.CANCELLED, null);

                mockMvc.perform(put("/api/admin/orders/" + order.id() + "/status")
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(cancelReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status", is("CANCELLED")));
        }
}
