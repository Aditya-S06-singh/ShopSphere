package com.shopsphere.product.dto;

import com.shopsphere.product.Category;

public record CategoryDto(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl
) {
    public static CategoryDto fromEntity(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl()
        );
    }
}

