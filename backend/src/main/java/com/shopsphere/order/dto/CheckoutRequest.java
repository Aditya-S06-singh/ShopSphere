package com.shopsphere.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Checkout request — the ONLY payment data we ever accept is a test token string.
 * Real card numbers are NEVER collected or stored anywhere in ShopSphere.
 *
 * Valid test tokens:
 *   tok_visa        — simulates a successful Visa payment
 *   tok_mastercard  — simulates a successful Mastercard payment
 *   tok_amex        — simulates a successful Amex payment
 *   tok_fail        — simulates a declined card
 */
public record CheckoutRequest(
        @NotBlank(message = "testPaymentToken is required (e.g. tok_visa, tok_fail)")
        String testPaymentToken,

        @NotBlank(message = "shippingAddress is required")
        @Size(max = 500)
        String shippingAddress
) {
}

