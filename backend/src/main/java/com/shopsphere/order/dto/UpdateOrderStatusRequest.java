package com.shopsphere.order.dto;

import com.shopsphere.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "status is required")
        OrderStatus status
) {
}

