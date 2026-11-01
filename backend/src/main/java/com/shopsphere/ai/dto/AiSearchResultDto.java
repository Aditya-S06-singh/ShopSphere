package com.shopsphere.ai.dto;

import com.shopsphere.product.dto.ProductDto;

public record AiSearchResultDto(
        ProductDto product,
        double relevanceScore,
        String matchReason
) {
}
