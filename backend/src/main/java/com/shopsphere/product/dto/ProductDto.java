package com.shopsphere.product.dto;

import com.shopsphere.product.Product;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductDto(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String sku,
        String imageUrl,
        Long categoryId,
        String categoryName,
        boolean inStock,
        boolean active,
        Instant createdAt
) {
    public static ProductDto fromEntity(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getSku(),
                product.getImageUrl(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getStockQuantity() > 0,
                product.isActive(),
                product.getCreatedAt()
        );
    }
}
