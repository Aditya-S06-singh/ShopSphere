package com.shopsphere.order;

import com.shopsphere.common.dto.PagedResponse;
import com.shopsphere.order.dto.CheckoutRequest;
import com.shopsphere.order.dto.OrderDto;
import com.shopsphere.security.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** POST /api/v1/orders/checkout — place a new order from the current cart */
    @PostMapping("/checkout")
    public ResponseEntity<OrderDto> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CheckoutRequest request
    ) {
        Long userId = resolveUserId(userDetails);
        OrderDto order = orderService.placeOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /** GET /api/v1/orders — paginated order history for the current user */
    @GetMapping
    public ResponseEntity<PagedResponse<OrderDto>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = resolveUserId(userDetails);
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(orderService.getUserOrders(userId, pageable));
    }

    /** GET /api/v1/orders/{id} — get a specific order (owner only) */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(orderService.getOrderById(userId, id));
    }

    /** PATCH /api/v1/orders/{id}/cancel — cancel an order (owner only) */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(orderService.cancelOrder(userId, id));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return ((UserDetailsServiceImpl.ShopSphereUserDetails) userDetails).getUserId();
    }
}

