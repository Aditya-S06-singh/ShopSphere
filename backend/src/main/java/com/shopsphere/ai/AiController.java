package com.shopsphere.ai;

import com.shopsphere.ai.dto.AiChatRequest;
import com.shopsphere.ai.dto.AiChatResponse;
import com.shopsphere.ai.dto.AiSearchResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final RagShoppingService ragShoppingService;

    public AiController(RagShoppingService ragShoppingService) {
        this.ragShoppingService = ragShoppingService;
    }

    /**
     * GET /api/v1/ai/search — Semantic vector similarity product search.
     * Evaluates natural language queries against active catalog products.
     */
    @GetMapping("/search")
    public ResponseEntity<AiSearchResponse> semanticSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit
    ) {
        AiSearchResponse response = ragShoppingService.searchProducts(query, Math.min(limit, 50));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ai/chat — Retrieval-Augmented Generation (RAG) shopping assistant.
     * Injects live catalog and stock data into contextual response generation.
     */
    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = ragShoppingService.chatWithAssistant(request);
        return ResponseEntity.ok(response);
    }
}

