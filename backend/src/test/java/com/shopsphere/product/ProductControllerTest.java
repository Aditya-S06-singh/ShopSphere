package com.shopsphere.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.product.dto.CreateProductRequest;
import com.shopsphere.product.dto.UpdateStockRequest;
import com.shopsphere.security.JwtService;
import com.shopsphere.user.Role;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    private Category testCategory;
    private Product testProduct;
    private String adminToken;
    private String customerToken;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // Seed users
        User admin = userRepository.save(new User(
                "admin_test@shopsphere.com",
                passwordEncoder.encode("Secret123"),
                "Admin",
                "User",
                Role.ROLE_ADMIN
        ));

        User customer = userRepository.save(new User(
                "cust_test@shopsphere.com",
                passwordEncoder.encode("Secret123"),
                "Customer",
                "User",
                Role.ROLE_CUSTOMER
        ));

        adminToken = jwtService.generateToken(userDetailsService.loadUserByUsername(admin.getEmail()));
        customerToken = jwtService.generateToken(userDetailsService.loadUserByUsername(customer.getEmail()));

        // Seed category and products
        testCategory = categoryRepository.save(new Category(
                "Test Electronics",
                "test-electronics",
                "Testing category description",
                "http://example.com/category.png"
        ));

        testProduct = productRepository.save(new Product(
                "Test Wireless Mouse",
                "test-wireless-mouse",
                "High precision ergonomic wireless optical mouse",
                new BigDecimal("49.99"),
                25,
                "TEST-MOUSE-01",
                "http://example.com/mouse.png",
                testCategory
        ));

        // Out of stock product
        productRepository.save(new Product(
                "Sold Out Keyboard",
                "sold-out-keyboard",
                "Mechanical gaming keyboard out of stock",
                new BigDecimal("99.99"),
                0,
                "TEST-KEY-02",
                "http://example.com/keyboard.png",
                testCategory
        ));
    }

    @Test
    void shouldGetAllCategoriesPublicly() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Electronics"));
    }

    @Test
    void shouldGetAllProductsWithPagination() throws Exception {
        mockMvc.perform(get("/api/v1/products?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].name").isNotEmpty());
    }

    @Test
    void shouldFilterProductsBySearchKeyword() throws Exception {
        mockMvc.perform(get("/api/v1/products?search=Mouse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Test Wireless Mouse"));
    }

    @Test
    void shouldFilterProductsByInStockOnly() throws Exception {
        mockMvc.perform(get("/api/v1/products?inStockOnly=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].sku").value("TEST-MOUSE-01"));
    }

    @Test
    void shouldForbidCustomerFromCreatingProduct() throws Exception {
        CreateProductRequest newProduct = new CreateProductRequest(
                "Unauthorized Product",
                "Should fail",
                new BigDecimal("19.99"),
                10,
                "UNAUTH-01",
                "http://example.com/img.png",
                testCategory.getId()
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAdminToCreateProduct() throws Exception {
        CreateProductRequest newProduct = new CreateProductRequest(
                "Admin Created Gadget",
                "Created by Admin test",
                new BigDecimal("129.99"),
                50,
                "ADMIN-GADGET-01",
                "http://example.com/gadget.png",
                testCategory.getId()
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Admin Created Gadget"))
                .andExpect(jsonPath("$.sku").value("ADMIN-GADGET-01"))
                .andExpect(jsonPath("$.stockQuantity").value(50));

        assertThat(productRepository.existsBySku("ADMIN-GADGET-01")).isTrue();
    }

    @Test
    void shouldAllowAdminToUpdateStock() throws Exception {
        UpdateStockRequest stockUpdate = new UpdateStockRequest(100);

        mockMvc.perform(patch("/api/v1/admin/products/" + testProduct.getId() + "/stock")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stockUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockQuantity").value(100));

        Product updated = productRepository.findById(testProduct.getId()).orElseThrow();
        assertThat(updated.getStockQuantity()).isEqualTo(100);
    }

    @Test
    void shouldAllowAdminToDeleteProduct() throws Exception {
        mockMvc.perform(delete("/api/v1/admin/products/" + testProduct.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        Product softDeleted = productRepository.findById(testProduct.getId()).orElseThrow();
        assertThat(softDeleted.isActive()).isFalse();
    }
}
