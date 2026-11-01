package com.shopsphere.cart;

import com.shopsphere.cart.dto.*;
import com.shopsphere.common.exception.ResourceNotFoundException;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartDto getCartDto(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toDto(cart);
    }

    public CartDto addItem(Long userId, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Requested: " + quantity + ", available: " + product.getStockQuantity());
        }

        Cart cart = getOrCreateCart(userId);

        // Upsert: increase quantity if already in cart, otherwise create new item
        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (item != null) {
            int newQty = item.getQuantity() + quantity;
            if (product.getStockQuantity() < newQty) {
                throw new IllegalArgumentException(
                        "Insufficient stock. Requested total: " + newQty + ", available: " + product.getStockQuantity());
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(cart, product, quantity, product.getPrice());
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        // Reload with items for accurate DTO
        Cart refreshed = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return toDto(refreshed);
    }

    public CartDto updateItemQuantity(Long userId, Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        // Ownership check — ensure this item belongs to the requesting user
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Cart item not found: " + cartItemId);
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Requested: " + quantity + ", available: " + product.getStockQuantity());
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        Cart refreshed = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return toDto(refreshed);
    }

    public CartDto removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Cart item not found: " + cartItemId);
        }

        cartItemRepository.delete(item);

        Cart refreshed = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return toDto(refreshed);
    }

    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserIdWithItems(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            return cartRepository.save(new Cart(user));
        });
    }

    private CartDto toDto(Cart cart) {
        List<CartItemDto> itemDtos = cart.getItems().stream()
                .map(item -> new CartItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSku(),
                        item.getProduct().getImageUrl(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                        item.getProduct().getStockQuantity(),
                        item.getAddedAt()
                ))
                .toList();

        int totalItems = itemDtos.stream().mapToInt(CartItemDto::quantity).sum();
        BigDecimal subtotal = itemDtos.stream()
                .map(CartItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartDto(cart.getId(), itemDtos, totalItems, subtotal);
    }
}

