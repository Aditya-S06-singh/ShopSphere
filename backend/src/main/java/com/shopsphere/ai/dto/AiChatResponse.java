package com.shopsphere.ai.dto;

import com.shopsphere.product.dto.ProductDto;
import java.util.List;

public record AiChatResponse(
        String reply,
        List<ProductDto> recommendedProducts,
        String source
) {
}

