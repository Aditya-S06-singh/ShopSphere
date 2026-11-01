package com.shopsphere.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.cart.CartItemRepository;
import com.shopsphere.cart.CartRepository;
import com.shopsphere.order.dto.CheckoutRequest;
import com.shopsphere.order.dto.UpdateOrderStatusRequest;
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

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminOrderControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired ProductRepository productRepository;
    @Autowired CartRepository cartRepository;
    @Autowired CartItemRepository cartItemRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired OrderService orderService;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;
    @Autowired UserDetailsService userDetailsService;

    private String adminToken;
    private String customerToken;
    private User customer;
    private Product product;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User admin = userRepository.save(new User(
                "admin_order@shopsphere.com",
                passwordEncoder.encode("Secret123"),
                "Admin", "Boss", Role.ROLE_ADMIN
        ));

        customer = userRepository.save(new User(
                "customer_order@shopsphere.com",
                passwordEncoder.encode("Secret123"),
                "Normal", "User", Role.ROLE_CUSTOMER
        ));

        adminToken = jwtService.generateToken(userDetailsService.loadUserByUsername(admin.getEmail()));
        customerToken = jwtService.generateToken(userDetailsService.loadUserByUsername(customer.getEmail()));

        Category category = categoryRepository.save(
                new Category("Admin Test Cat", "admin-cat", "Desc", null));

        product = productRepository.save(new Product(
                "Mechanical Keyboard", "admin-mech-keyboard", "Awesome keyboard",
                new BigDecimal("120.00"), 10, "ADM-KEY-01", null, category));
    }

    private Order createTestOrder(OrderStatus status) {
        Order order = new Order();
        order.setOrderNumber("SS-ADMTEST1");
        order.setUser(customer);
        order.setStatus(status);
        order.setTotalAmount(new BigDecimal("240.00"));
        order.setShippingAddress("100 Admin Blvd");
        order.setPaymentReference("sim_ch_admtest123");

        OrderItem item = new OrderItem(
                order, product, 2, new BigDecimal("120.00"), product.getName(), product.getSku());
        order.getItems().add(item);

        product.setStockQuantity(product.getStockQuantity() - 2);
        productRepository.save(product);

        return orderRepository.save(order);
    }

    @Test
    void shouldReturnDashboardStatsForAdmin() throws Exception {
        createTestOrder(OrderStatus.PAYMENT_CONFIRMED);

        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(240.00))
                .andExpect(jsonPath("$.totalOrders").value(1))
                .andExpect(jsonPath("$.activeOrders").value(1))
                .andExpect(jsonPath("$.totalProducts").value(1))
                .andExpect(jsonPath("$.recentOrders").isArray());
    }

    @Test
    void shouldForbidCustomerFromAccessingDashboardStats() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldListOrdersForAdminWithFilter() throws Exception {
        createTestOrder(OrderStatus.PROCESSING);

        mockMvc.perform(get("/api/v1/admin/orders?status=PROCESSING")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].status").value("PROCESSING"));
    }

    @Test
    void shouldUpdateOrderStatusToShipped() throws Exception {
        Order order = createTestOrder(OrderStatus.PAYMENT_CONFIRMED);

        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest(OrderStatus.SHIPPED);

        mockMvc.perform(patch("/api/v1/admin/orders/" + order.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"));

        Order updated = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(OrderStatus.SHIPPED);
    }

    @Test
    void shouldRestoreStockWhenAdminCancelsOrder() throws Exception {
        Order order = createTestOrder(OrderStatus.PAYMENT_CONFIRMED);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity()).isEqualTo(8);

        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest(OrderStatus.CANCELLED);

        mockMvc.perform(patch("/api/v1/admin/orders/" + order.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Stock restored back from 8 to 10
        Product restocked = productRepository.findById(product.getId()).orElseThrow();
        assertThat(restocked.getStockQuantity()).isEqualTo(10);
    }
}
