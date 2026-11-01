package com.shopsphere.ai.dto;

import java.util.List;

public record AiSearchResponse(
        String query,
        int totalResults,
        List<AiSearchResultDto> results
) {
}

