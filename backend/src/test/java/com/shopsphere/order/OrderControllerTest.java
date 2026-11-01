package com.shopsphere.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.cart.CartItemRepository;
import com.shopsphere.cart.CartRepository;
import com.shopsphere.cart.CartService;
import com.shopsphere.cart.dto.AddToCartRequest;
import com.shopsphere.order.dto.CheckoutRequest;
import com.shopsphere.product.Category;
import com.shopsphere.product.CategoryRepository;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired ProductRepository productRepository;
    @Autowired CartRepository cartRepository;
    @Autowired CartItemRepository cartItemRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired CartService cartService;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;
    @Autowired UserDetailsService userDetailsService;

    private String customerToken;
    private User customer;
    private Product product;

    @BeforeEach
    void setUp() {
        // Clean up in FK-safe order
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(new User(
                "order_cust@shopsphere.com",
                passwordEncoder.encode("Secret123"),
                "Order", "Customer", Role.ROLE_CUSTOMER
        ));

        customerToken = jwtService.generateToken(userDetailsService.loadUserByUsername(customer.getEmail()));

        Category category = categoryRepository.save(
                new Category("Test Cat", "test-cat-order", "Order test category", null));

        product = productRepository.save(new Product(
                "Test Laptop", "test-laptop-order", "A test laptop",
                new BigDecimal("999.99"), 5, "ORD-LAPTOP-01", null, category));
    }

    /** Helper: add an item to the authenticated user's cart via API */
    private void addToCart(int quantity) throws Exception {
        AddToCartRequest req = new AddToCartRequest(product.getId(), quantity);
        mockMvc.perform(post("/api/v1/cart/items")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));
    }

    @Test
    void shouldPlaceOrderSuccessfullyWithVisaToken() throws Exception {
        addToCart(2);

        CheckoutRequest req = new CheckoutRequest("tok_visa", "123 Main Street, Test City, 400001");

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value(org.hamcrest.Matchers.startsWith("SS-")))
                .andExpect(jsonPath("$.status").value("PAYMENT_CONFIRMED"))
                .andExpect(jsonPath("$.paymentReference").value(org.hamcrest.Matchers.startsWith("sim_ch_")))
                .andExpect(jsonPath("$.totalAmount").value(1999.98));

        // Stock should have decremented by 2
        Product updated = productRepository.findById(product.getId()).orElseThrow();
        assertThat(updated.getStockQuantity()).isEqualTo(3);
    }

    @Test
    void shouldReturnPaymentRequiredForFailToken() throws Exception {
        addToCart(1);

        CheckoutRequest req = new CheckoutRequest("tok_fail", "456 Decline Road, Fail City");

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isPaymentRequired());

        // Stock must NOT have changed — transaction rolled back
        Product unchanged = productRepository.findById(product.getId()).orElseThrow();
        assertThat(unchanged.getStockQuantity()).isEqualTo(5);
    }

    @Test
    void shouldReturnConflictForEmptyCart() throws Exception {
        // Don't add anything to cart
        CheckoutRequest req = new CheckoutRequest("tok_visa", "789 Empty Lane");

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldListUserOrderHistory() throws Exception {
        addToCart(1);
        CheckoutRequest req = new CheckoutRequest("tok_mastercard", "1 History Lane");
        mockMvc.perform(post("/api/v1/orders/checkout")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));

        mockMvc.perform(get("/api/v1/orders")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].status").value("PAYMENT_CONFIRMED"));
    }

    @Test
    void shouldGetOrderByIdForOwner() throws Exception {
        addToCart(1);
        CheckoutRequest checkReq = new CheckoutRequest("tok_amex", "2 Detail Street");
        MvcResult checkResult = mockMvc.perform(post("/api/v1/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkReq)))
                .andReturn();

        long orderId = objectMapper.readTree(checkResult.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].productName").value("Test Laptop"));
    }

    @Test
    void shouldCancelOrderAndRestoreStock() throws Exception {
        addToCart(2);
        CheckoutRequest checkReq = new CheckoutRequest("tok_visa", "3 Cancel Ave");
        MvcResult checkResult = mockMvc.perform(post("/api/v1/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkReq)))
                .andReturn();

        long orderId = objectMapper.readTree(checkResult.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(patch("/api/v1/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Stock should be restored
        Product restored = productRepository.findById(product.getId()).orElseThrow();
        assertThat(restored.getStockQuantity()).isEqualTo(5);
    }

    @Test
    void shouldRequireAuthForOrders() throws Exception {
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized());
    }
}

