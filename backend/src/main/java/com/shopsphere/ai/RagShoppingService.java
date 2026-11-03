package com.shopsphere.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.ai.dto.*;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.product.dto.ProductDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RagShoppingService {

    private static final Logger log = LoggerFactory.getLogger(RagShoppingService.class);

    private final ProductRepository productRepository;
    private final SemanticVectorEngine vectorEngine;
    private final ObjectMapper objectMapper;
    private volatile RestClient restClient;

    @Value("${app.ai.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini-model:gemini-3.8-flash}")
    private String geminiModel;

    public RagShoppingService(
            ProductRepository productRepository,
            SemanticVectorEngine vectorEngine,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.vectorEngine = vectorEngine;
        this.objectMapper = objectMapper;
    }

    private RestClient getRestClient() {
        if (this.restClient == null) {
            synchronized (this) {
                if (this.restClient == null) {
                    var requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
                    requestFactory.setConnectTimeout(java.time.Duration.ofMillis(5000));
                    requestFactory.setReadTimeout(java.time.Duration.ofMillis(35000));
                    this.restClient = RestClient.builder()
                            .requestFactory(requestFactory)
                            .build();
                }
            }
        }
        return this.restClient;
    }

    /**
     * Executes Semantic Search across active catalog products.
     */
    public AiSearchResponse searchProducts(String query, int limit) {
        List<Product> allProducts = productRepository.findAll();
        List<SemanticVectorEngine.ScoredProduct> ranked = vectorEngine.rankProducts(allProducts, query, limit);

        List<AiSearchResultDto> results = ranked.stream()
                .map(r -> new AiSearchResultDto(
                        ProductDto.fromEntity(r.product()),
                        Math.round(r.score() * 100.0) / 100.0,
                        r.matchReason()
                ))
                .toList();

        return new AiSearchResponse(query, results.size(), results);
    }

    /**
     * RAG Shopping Assistant pipeline:
     * 1. Retrieve: semantic retrieval of top matching products.
     * 2. Augment: inject live product data into the context prompt.
     * 3. Generate: call Gemini if API key is configured, or use built-in concierge generator.
     */
    public AiChatResponse chatWithAssistant(AiChatRequest request) {
        String query = request.message().trim();

        List<Product> allProducts = productRepository.findAll();
        List<SemanticVectorEngine.ScoredProduct> ranked = vectorEngine.rankProducts(allProducts, query, 4);

        List<ProductDto> recommendedDtos = ranked.stream()
                .map(r -> ProductDto.fromEntity(r.product()))
                .toList();

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String llmReply = callGeminiLlm(query, ranked, request.history());
                if (llmReply != null && !llmReply.isBlank()) {
                    log.info("Successfully generated AI response via Google Gemini API ({})", geminiModel);
                    return new AiChatResponse(llmReply, recommendedDtos, "GEMINI_LLM");
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed: {}. Falling back to local RAG concierge.", e.getMessage());
            }
        }

        String localReply = generateLocalRagResponse(query, ranked);
        return new AiChatResponse(localReply, recommendedDtos, "LOCAL_RAG_CONCIERGE");
    }

    private String callGeminiLlm(
            String query,
            List<SemanticVectorEngine.ScoredProduct> ranked,
            List<ChatMessageDto> history
    ) throws Exception {
        List<String> candidateModels = new ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            candidateModels.add(geminiModel.trim());
        }
        for (String m : List.of("gemini-3.5-flash-lite", "gemini-3.5-flash")) {
            if (!candidateModels.contains(m)) {
                candidateModels.add(m);
            }
        }

        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("You are SphereAI, the helpful, polite, and knowledgeable AI shopping assistant for ShopSphere.\n");
        contextBuilder.append("Here is the live real-time inventory from our PostgreSQL catalog relevant to the customer's query:\n\n");

        if (ranked.isEmpty()) {
            contextBuilder.append("(No exact catalog products matched the customer query).\n");
        } else {
            for (var rp : ranked) {
                Product p = rp.product();
                contextBuilder.append(String.format(
                        "- %s (SKU: %s): Price Rs. %.2f, Stock: %d. Description: %s\n",
                        p.getName(), p.getSku(), p.getPrice(), p.getStockQuantity(), p.getDescription()
                ));
            }
        }

        contextBuilder.append("\nInstructions:\n");
        contextBuilder.append("1. Answer the customer's question directly using ONLY the real products provided above.\n");
        contextBuilder.append("2. Include pricing (in Rs.) and stock status when recommending an item.\n");
        contextBuilder.append("3. Keep responses concise, friendly, and under 80 words in Markdown.\n\n");
        contextBuilder.append("Customer question: ").append(query);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", contextBuilder.toString())
                        ))
                ),
                "generationConfig", Map.of(
                        "maxOutputTokens", 250,
                        "temperature", 0.6
                )
        );

        Exception lastException = null;
        for (String model : candidateModels) {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + geminiApiKey;
            try {
                byte[] responseBytes = getRestClient().post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.ALL)
                        .body(body)
                        .retrieve()
                        .body(byte[].class);

                if (responseBytes == null || responseBytes.length == 0) {
                    continue;
                }

                String jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);

                JsonNode root = objectMapper.readTree(jsonResponse);
                String reply = root.path("candidates").get(0)
                        .path("content").path("parts").get(0)
                        .path("text").asText();
                if (reply != null && !reply.isBlank()) {
                    log.info("Successfully generated AI response via Google Gemini API ({})", model);
                    return reply;
                }
            } catch (Exception ex) {
                lastException = ex;
                log.warn("Gemini model {} failed: {}", model, ex.getMessage());
            }
        }

        if (lastException != null) {
            throw lastException;
        }
        return null;
    }

    private String generateLocalRagResponse(
            String query,
            List<SemanticVectorEngine.ScoredProduct> ranked
    ) {
        StringBuilder sb = new StringBuilder();

        if (ranked.isEmpty()) {
            sb.append("Hello! I searched our current catalog for **\"").append(query).append("\"**, ");
            sb.append("but I couldn't find an exact match right now.\n\n");
            sb.append("💡 **Suggestion**: Try searching for keywords like *\"wireless\"*, *\"keyboard\"*, *\"mouse\"*, or *\"headphones\"*, ");
            sb.append("or browse all items in the catalog above!");
            return sb.toString();
        }

        sb.append("Hello! Based on our live catalog, here are the top recommendations matching **\"")
                .append(query).append("\"**:\n\n");

        for (int i = 0; i < ranked.size(); i++) {
            Product p = ranked.get(i).product();
            String reason = ranked.get(i).matchReason();

            sb.append(String.format(
                    "**%d. %s** — **Rs. %.2f**\n",
                    i + 1, p.getName(), p.getPrice()
            ));

            if (p.getStockQuantity() > 0) {
                sb.append("   • *In Stock* (").append(p.getStockQuantity()).append(" units available)\n");
            } else {
                sb.append("   • *Currently Out of Stock*\n");
            }

            sb.append("   • ").append(p.getDescription()).append("\n");
            sb.append("   • *Why this fits*: ").append(reason).append("\n\n");
        }

        sb.append("You can click on any product card below to inspect specifications or add it directly to your shopping cart!");
        return sb.toString();
    }
}

