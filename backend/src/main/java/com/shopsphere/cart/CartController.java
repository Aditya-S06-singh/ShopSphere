package com.shopsphere.cart;

import com.shopsphere.cart.dto.*;
import com.shopsphere.security.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Cart endpoints — all require the user to be authenticated.
 * The authenticated user's ID is resolved from the JWT via @AuthenticationPrincipal.
 */
@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /** GET /api/v1/cart — return the current user's cart */
    @GetMapping
    public ResponseEntity<CartDto> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(cartService.getCartDto(userId));
    }

    /** POST /api/v1/cart/items — add a product to cart */
    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddToCartRequest request
    ) {
        Long userId = resolveUserId(userDetails);
        CartDto cart = cartService.addItem(userId, request.productId(), request.quantity());
        return ResponseEntity.ok(cart);
    }

    /** PATCH /api/v1/cart/items/{itemId} — update quantity of a cart item */
    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        Long userId = resolveUserId(userDetails);
        CartDto cart = cartService.updateItemQuantity(userId, itemId, request.quantity());
        return ResponseEntity.ok(cart);
    }

    /** DELETE /api/v1/cart/items/{itemId} — remove one item from cart */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId
    ) {
        Long userId = resolveUserId(userDetails);
        CartDto cart = cartService.removeItem(userId, itemId);
        return ResponseEntity.ok(cart);
    }

    /** DELETE /api/v1/cart — clear the entire cart */
    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extracts the user's database ID from the JWT principal.
     * UserDetailsServiceImpl.ShopSphereUserDetails carries the User entity id.
     */
    private Long resolveUserId(UserDetails userDetails) {
        return ((UserDetailsServiceImpl.ShopSphereUserDetails) userDetails).getUserId();
    }
}

