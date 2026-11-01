package com.shopsphere.order;

import com.shopsphere.common.dto.PagedResponse;
import com.shopsphere.order.dto.DashboardStatsDto;
import com.shopsphere.order.dto.OrderDto;
import com.shopsphere.order.dto.UpdateOrderStatusRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** GET /api/v1/admin/orders — list all orders across the platform with optional status filter */
    @GetMapping("/orders")
    public ResponseEntity<PagedResponse<OrderDto>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin(status, pageable));
    }

    /** GET /api/v1/admin/orders/{id} — view any order by ID */
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderByIdForAdmin(id));
    }

    /** PATCH /api/v1/admin/orders/{id}/status — update lifecycle status (PROCESSING, SHIPPED, DELIVERED, CANCELLED) */
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatusByAdmin(id, request.status()));
    }

    /** GET /api/v1/admin/dashboard/stats — aggregate business KPIs and recent orders */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(orderService.getDashboardStats());
    }
}

