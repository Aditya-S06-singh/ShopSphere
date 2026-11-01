package com.shopsphere.order.dto;

import com.shopsphere.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDto(
        Long id,
        String orderNumber,
        OrderStatus status,
        BigDecimal totalAmount,
        String shippingAddress,
        String paymentReference,
        String customerEmail,
        String customerName,
        List<OrderItemDto> items,
        Instant createdAt,
        Instant updatedAt
) {
}

