package com.shopsphere.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDto(
        Long id,
        List<CartItemDto> items,
        int totalItems,
        BigDecimal subtotal
) {
}

