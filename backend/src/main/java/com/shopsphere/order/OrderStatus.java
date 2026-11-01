package com.shopsphere.order;

/**
 * Lifecycle of an order:
 *   PENDING → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED
 *                                     ↓
 *                                  CANCELLED  (allowed from PENDING or PAYMENT_CONFIRMED only)
 */
public enum OrderStatus {
    PENDING,
    PAYMENT_CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}

