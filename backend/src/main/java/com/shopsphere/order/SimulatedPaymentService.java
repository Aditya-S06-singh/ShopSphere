package com.shopsphere.order;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

/**
 * Simulated payment service — NO real card data is ever processed here.
 *
 * In a real production application this class would call a payment provider
 * (Stripe, Razorpay, etc.) using their official SDK.  For this demo we simply
 * map test token strings to pass/fail outcomes, which lets us exercise the
 * entire checkout flow end-to-end without touching real money.
 *
 * Accepted test tokens:
 *   tok_visa        → success
 *   tok_mastercard  → success
 *   tok_amex        → success
 *   tok_fail        → payment declined
 */
@Service
public class SimulatedPaymentService {

    private static final Set<String> ACCEPTED_TOKENS = Set.of(
            "tok_visa", "tok_mastercard", "tok_amex"
    );

    /**
     * "Process" a payment and return a simulated payment reference.
     *
     * @param testToken  one of tok_visa / tok_mastercard / tok_amex / tok_fail
     * @param amount     the amount to charge (for logging purposes)
     * @return a fake payment reference string (like a Stripe charge ID)
     * @throws PaymentDeclinedException if the token simulates a declined card
     * @throws IllegalArgumentException if the token is not a recognised test token
     */
    public String processPayment(String testToken, BigDecimal amount) {
        if ("tok_fail".equals(testToken)) {
            throw new PaymentDeclinedException("Payment declined by simulated processor. Use tok_visa for success.");
        }

        if (!ACCEPTED_TOKENS.contains(testToken)) {
            throw new IllegalArgumentException(
                    "Unknown test token '" + testToken + "'. Use tok_visa, tok_mastercard, tok_amex, or tok_fail.");
        }

        // Return a fake charge reference — looks like a real payment provider reference
        return "sim_ch_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    /** Thrown when the simulated card is declined. */
    public static class PaymentDeclinedException extends RuntimeException {
        public PaymentDeclinedException(String message) {
            super(message);
        }
    }
}

