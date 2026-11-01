package com.shopsphere.order;

import com.shopsphere.cart.Cart;
import com.shopsphere.cart.CartItem;
import com.shopsphere.cart.CartService;
import com.shopsphere.common.dto.PagedResponse;
import com.shopsphere.common.exception.ResourceNotFoundException;
import com.shopsphere.order.dto.CheckoutRequest;
import com.shopsphere.order.dto.OrderDto;
import com.shopsphere.order.dto.OrderItemDto;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final SimulatedPaymentService paymentService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        CartService cartService,
                        SimulatedPaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.paymentService = paymentService;
    }

    // ─── Place order ────────────────────────────────────────────────────────────

    /**
     * Full checkout flow in one @Transactional method:
     * 1. Load cart, validate not empty
     * 2. Validate stock for all items
     * 3. Run simulated payment (throws on failure → transaction rolls back)
     * 4. Decrement stock atomically
     * 5. Create Order + OrderItems
     * 6. Clear the cart
     */
    @Transactional
    public OrderDto placeOrder(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Cart cart = cartService.getOrCreateCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart.");
        }

        // ── 1. Stock validation ────────────────────────────────────────────────
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (!product.isActive()) {
                throw new IllegalStateException("Product '" + product.getName() + "' is no longer available.");
            }
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalStateException(
                        "Insufficient stock for '" + product.getName() + "'. " +
                        "Requested: " + item.getQuantity() + ", available: " + product.getStockQuantity());
            }
        }

        // ── 2. Calculate total ─────────────────────────────────────────────────
        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ── 3. Simulated payment ───────────────────────────────────────────────
        // Throws PaymentDeclinedException or IllegalArgumentException on failure.
        // Because we're inside @Transactional, any exception here rolls back
        // the entire transaction — stock is never decremented on payment failure.
        String paymentRef = paymentService.processPayment(request.testPaymentToken(), total);

        // ── 4. Build Order ─────────────────────────────────────────────────────
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setStatus(OrderStatus.PAYMENT_CONFIRMED);
        order.setTotalAmount(total);
        order.setShippingAddress(request.shippingAddress());
        order.setPaymentReference(paymentRef);

        // ── 5. Build OrderItems + decrement stock ──────────────────────────────
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    cartItem.getQuantity(),
                    cartItem.getUnitPrice(),
                    product.getName(),
                    product.getSku()
            );
            order.getItems().add(orderItem);

            // Decrement stock — product is a managed entity so this is a dirty update
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        Order savedOrder = orderRepository.save(order);

        // ── 6. Clear the cart ──────────────────────────────────────────────────
        cartService.clearCart(userId);

        return toDto(savedOrder);
    }

    // ─── Query methods ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        Page<Order> page = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<OrderDto> dtos = page.getContent().stream().map(this::toDto).toList();
        return new PagedResponse<>(
                dtos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        // Ownership check — a customer can only view their own orders
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }

        return toDto(order);
    }

    // ─── Cancel order ───────────────────────────────────────────────────────────

    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAYMENT_CONFIRMED) {
            throw new IllegalStateException(
                    "Cannot cancel an order with status: " + order.getStatus() +
                    ". Only PENDING or PAYMENT_CONFIRMED orders can be cancelled.");
        }

        // Restore stock for each item
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private String generateOrderNumber() {
        // e.g. "SS-A1B2C3D4" — short, human-readable, unique enough for a demo
        return "SS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getProductSku(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .toList();

        return new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getPaymentReference(),
                itemDtos,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}

