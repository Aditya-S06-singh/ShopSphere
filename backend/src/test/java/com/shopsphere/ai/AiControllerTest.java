package com.shopsphere.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.ai.dto.AiChatRequest;
import com.shopsphere.cart.CartItemRepository;
import com.shopsphere.cart.CartRepository;
import com.shopsphere.order.OrderRepository;
import com.shopsphere.product.Category;
import com.shopsphere.product.CategoryRepository;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired ProductRepository productRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired UserRepository userRepository;
    @Autowired CartRepository cartRepository;
    @Autowired CartItemRepository cartItemRepository;
    @Autowired OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        Category electronics = categoryRepository.save(
                new Category("Electronics", "electronics", "Tech & gadgets", null));

        productRepository.save(new Product(
                "Mechanical Gaming Keyboard", "mech-keyboard",
                "High-grade switches for fast ergonomic typing and programming",
                new BigDecimal("89.99"), 15, "AI-KEY-01", null, electronics));

        productRepository.save(new Product(
                "Wireless Optical Mouse", "wireless-mouse",
                "Compact lightweight wireless mouse with precision laser sensor",
                new BigDecimal("29.99"), 30, "AI-MOUSE-02", null, electronics));

        productRepository.save(new Product(
                "Noise Cancelling Headphones", "nc-headphones",
                "Premium over-ear wireless audio with studio quality sound",
                new BigDecimal("199.99"), 5, "AI-HDP-03", null, electronics));
    }

    @Test
    void shouldPerformSemanticSearchWithRelevanceScores() throws Exception {
        mockMvc.perform(get("/api/v1/ai/search?query=ergonomic typing switches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("ergonomic typing switches"))
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].product.name").value("Mechanical Gaming Keyboard"))
                .andExpect(jsonPath("$.results[0].relevanceScore").isNumber());
    }

    @Test
    void shouldHonorMaxBudgetInSemanticSearch() throws Exception {
        // Query specifying under $50 should match the mouse ($29.99) but exclude keyboard ($89.99) and headphones ($199.99)
        mockMvc.perform(get("/api/v1/ai/search?query=wireless gear under $50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].product.name").value("Wireless Optical Mouse"));
    }

    @Test
    void shouldChatWithRagAssistantAndReturnLiveProducts() throws Exception {
        AiChatRequest request = new AiChatRequest("I need gear for music and sound", List.of());

        mockMvc.perform(post("/api/v1/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").isNotEmpty())
                .andExpect(jsonPath("$.recommendedProducts").isArray())
                .andExpect(jsonPath("$.recommendedProducts[0].name").value("Noise Cancelling Headphones"))
                .andExpect(jsonPath("$.source").value("LOCAL_RAG_CONCIERGE"));
    }

    @Test
    void shouldHandleEmptyCatalogMatchesPolitely() throws Exception {
        AiChatRequest request = new AiChatRequest("vintage space rocket fuel tank", List.of());

        mockMvc.perform(post("/api/v1/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").isNotEmpty())
                .andExpect(jsonPath("$.recommendedProducts").isEmpty());
    }
}
