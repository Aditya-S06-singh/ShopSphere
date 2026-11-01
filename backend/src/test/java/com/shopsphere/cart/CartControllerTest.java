package com.shopsphere.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.cart.dto.AddToCartRequest;
import com.shopsphere.cart.dto.UpdateCartItemRequest;
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
class CartControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired ProductRepository productRepository;
    @Autowired CartRepository cartRepository;
    @Autowired CartItemRepository cartItemRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;
    @Autowired UserDetailsService userDetailsService;

    private String customerToken;
    private Product inStockProduct;
    private Product outOfStockProduct;

    @BeforeEach
    void setUp() {
        // Clean up in correct FK order
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User customer = userRepository.save(new User(
                "cart_cust@shopsphere.com",
                passwordEncoder.encode("Secret123"),
                "Cart", "Customer", Role.ROLE_CUSTOMER
        ));

        customerToken = jwtService.generateToken(userDetailsService.loadUserByUsername(customer.getEmail()));

        Category category = categoryRepository.save(
                new Category("Electronics", "electronics", "Electronics desc", null));

        inStockProduct = productRepository.save(new Product(
                "Wireless Mouse", "wireless-mouse-cart", "A nice mouse",
                new BigDecimal("29.99"), 10, "CART-MOUSE-01", null, category));

        outOfStockProduct = productRepository.save(new Product(
                "Sold Out Headphones", "sold-out-hdp-cart", "OOS headphones",
                new BigDecimal("79.99"), 0, "CART-HDP-01", null, category));
    }

    @Test
    void shouldGetEmptyCartForNewUser() throws Exception {
        mockMvc.perform(get("/api/v1/cart")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    void shouldAddItemToCart() throws Exception {
        AddToCartRequest req = new AddToCartRequest(inStockProduct.getId(), 2);

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].productId").value(inStockProduct.getId()))
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void shouldRejectAddingOutOfStockProduct() throws Exception {
        AddToCartRequest req = new AddToCartRequest(outOfStockProduct.getId(), 1);

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUpdateCartItemQuantity() throws Exception {
        // First add an item
        AddToCartRequest addReq = new AddToCartRequest(inStockProduct.getId(), 1);
        MvcResult addResult = mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andReturn();

        // Extract itemId from response
        var cartNode = objectMapper.readTree(addResult.getResponse().getContentAsString());
        long itemId = cartNode.get("items").get(0).get("id").asLong();

        // Update quantity to 3
        UpdateCartItemRequest updateReq = new UpdateCartItemRequest(3);
        mockMvc.perform(patch("/api/v1/cart/items/" + itemId)
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3));
    }

    @Test
    void shouldRemoveItemFromCart() throws Exception {
        // Add first
        AddToCartRequest addReq = new AddToCartRequest(inStockProduct.getId(), 2);
        MvcResult addResult = mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andReturn();

        long itemId = objectMapper.readTree(addResult.getResponse().getContentAsString())
                .get("items").get(0).get("id").asLong();

        // Remove
        mockMvc.perform(delete("/api/v1/cart/items/" + itemId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void shouldClearCart() throws Exception {
        // Add item first
        AddToCartRequest addReq = new AddToCartRequest(inStockProduct.getId(), 1);
        mockMvc.perform(post("/api/v1/cart/items")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)));

        // Clear
        mockMvc.perform(delete("/api/v1/cart")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNoContent());

        // Verify empty
        mockMvc.perform(get("/api/v1/cart")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void shouldRequireAuthForCart() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized());
    }
}

