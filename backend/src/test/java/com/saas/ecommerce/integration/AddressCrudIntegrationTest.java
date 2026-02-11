package com.saas.ecommerce.integration;

import com.saas.ecommerce.dto.address.AddressRequest;
import com.saas.ecommerce.dto.address.AddressResponse;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import com.saas.ecommerce.repository.AddressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AddressCrudIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private AddressRepository addressRepository;

    private User customer;
    private String customerToken;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        // Setup Customer (Global, no store bound for user itself, but logic might
        // require context)
        // Store is not strictly needed for Address CRUD as it is user-bound, but good
        // to have context.
        customer = createUser("Customer Address", "customer.addr@test.com", UserRole.CLIENTE, null);
        customerToken = generateToken(customer);
    }

    @Test
    @DisplayName("Should create address for customer")
    void createAddress() throws Exception {
        AddressRequest request = new AddressRequest(
                "Rua Teste", "123", "Apto 101", "Centro", "São Paulo", "SP", "01001-000", true);

        mockMvc.perform(post("/api/customer/addresses")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.street", is("Rua Teste")))
                .andExpect(jsonPath("$.zipCode", is("01001-000")))
                .andExpect(jsonPath("$.isDefault", is(true)));
    }

    @Test
    @DisplayName("Should list addresses for customer")
    void listAddresses() throws Exception {
        AddressRequest request = new AddressRequest(
                "Rua Teste", "123", "Apto 101", "Centro", "São Paulo", "SP", "01001-000", true);

        mockMvc.perform(post("/api/customer/addresses")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/customer/addresses")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].street", is("Rua Teste")));
    }

    @Test
    @DisplayName("Should update address")
    void updateAddress() throws Exception {
        AddressRequest createRequest = new AddressRequest(
                "Rua Teste", "123", "Apto 101", "Centro", "São Paulo", "SP", "01001-000", true);

        String responseJson = mockMvc.perform(post("/api/customer/addresses")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        AddressResponse createdAddress = objectMapper.readValue(responseJson, AddressResponse.class);

        AddressRequest updateRequest = new AddressRequest(
                "Rua Atualizada", "456", "Casa", "Bairro Novo", "Rio de Janeiro", "RJ", "20000-000", false);

        mockMvc.perform(put("/api/customer/addresses/" + createdAddress.id())
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.street", is("Rua Atualizada")))
                .andExpect(jsonPath("$.state", is("RJ")));
    }

    @Test
    @DisplayName("Should delete address")
    void deleteAddress() throws Exception {
        AddressRequest createRequest = new AddressRequest(
                "Rua Teste", "123", "Apto 101", "Centro", "São Paulo", "SP", "01001-000", true);

        String responseJson = mockMvc.perform(post("/api/customer/addresses")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        AddressResponse createdAddress = objectMapper.readValue(responseJson, AddressResponse.class);

        mockMvc.perform(delete("/api/customer/addresses/" + createdAddress.id())
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/customer/addresses/" + createdAddress.id())
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }
}
