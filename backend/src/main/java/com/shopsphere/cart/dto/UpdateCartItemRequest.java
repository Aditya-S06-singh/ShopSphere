package com.shopsphere.cart.dto;

import jakarta.validation.constraints.Min;

public record UpdateCartItemRequest(
        @Min(value = 1, message = "quantity must be at least 1")
        int quantity
) {
}

