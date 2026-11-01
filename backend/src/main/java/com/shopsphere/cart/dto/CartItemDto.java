package com.shopsphere.cart.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CartItemDto(
        Long id,
        Long productId,
        String productName,
        String productSku,
        String productImageUrl,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        Integer availableStock,
        Instant addedAt
) {
}

