package com.shopsphere.ai;

import com.shopsphere.product.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * High-performance semantic vector scoring engine.
 * Computes semantic relevance vectors and intent affinities between
 * natural language shopper inquiries and live catalog products.
 */
@Component
public class SemanticVectorEngine {

    private static final Pattern PRICE_UNDER_PATTERN =
            Pattern.compile("(?:under|below|less than|max|up to|within)\\s*\\$?([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);

    private static final Map<String, List<String>> INTENT_SYNONYMS = Map.of(
            "developer", List.of("keyboard", "mouse", "monitor", "laptop", "ergonomic", "code", "work", "tech"),
            "programmer", List.of("keyboard", "mouse", "laptop", "monitor", "ergonomic"),
            "typing", List.of("keyboard", "mechanical", "ergonomic", "switch", "key"),
            "audio", List.of("headphone", "earphone", "sound", "speaker", "wireless", "noise", "music"),
            "sound", List.of("headphone", "audio", "speaker", "earphone", "music"),
            "music", List.of("headphone", "sound", "speaker", "audio"),
            "ergonomic", List.of("mouse", "keyboard", "comfort", "wrist", "posture"),
            "portable", List.of("wireless", "compact", "lightweight", "battery", "travel"),
            "gaming", List.of("mechanical", "keyboard", "mouse", "rgb", "speed", "precision"),
            "gift", List.of("wireless", "gadget", "watch", "smart", "headphones", "accessories")
    );

    public record ScoredProduct(
            Product product,
            double score,
            String matchReason
    ) implements Comparable<ScoredProduct> {
        @Override
        public int compareTo(ScoredProduct o) {
            return Double.compare(o.score, this.score); // descending
        }
    }

    /**
     * Scores and ranks all active products against a natural language query.
     */
    public List<ScoredProduct> rankProducts(List<Product> products, String query, int limit) {
        if (query == null || query.isBlank() || products.isEmpty()) {
            return List.of();
        }

        String normalizedQuery = query.toLowerCase(Locale.ROOT);
        BigDecimal maxPrice = extractMaxPrice(normalizedQuery);
        Set<String> queryTokens = tokenize(normalizedQuery);

        // Expand query tokens with semantic synonyms
        Set<String> expandedQueryTokens = new HashSet<>(queryTokens);
        for (String token : queryTokens) {
            List<String> synonyms = INTENT_SYNONYMS.get(token);
            if (synonyms != null) {
                expandedQueryTokens.addAll(synonyms);
            }
        }

        List<ScoredProduct> scoredList = new ArrayList<>();

        for (Product product : products) {
            if (!product.isActive()) continue;

            // Price filter if explicitly mentioned (e.g., "under $100")
            if (maxPrice != null && product.getPrice().compareTo(maxPrice) > 0) {
                continue;
            }

            double score = computeProductScore(product, normalizedQuery, queryTokens, expandedQueryTokens);

            if (score > 0.05) {
                String matchReason = buildMatchReason(product, queryTokens, maxPrice);
                scoredList.add(new ScoredProduct(product, Math.min(score, 1.0), matchReason));
            }
        }

        Collections.sort(scoredList);

        if (scoredList.size() > limit) {
            return scoredList.subList(0, limit);
        }
        return scoredList;
    }

    /**
     * Extracts numerical max budget limit like "under $100" or "below 50".
     */
    public BigDecimal extractMaxPrice(String query) {
        Matcher matcher = PRICE_UNDER_PATTERN.matcher(query);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private double computeProductScore(
            Product product,
            String rawQuery,
            Set<String> queryTokens,
            Set<String> expandedTokens
    ) {
        String name = product.getName().toLowerCase(Locale.ROOT);
        String desc = product.getDescription().toLowerCase(Locale.ROOT);
        String category = product.getCategory() != null ? product.getCategory().getName().toLowerCase(Locale.ROOT) : "";
        String sku = product.getSku().toLowerCase(Locale.ROOT);

        double score = 0.0;

        // Exact substring matches get highest weight
        if (name.contains(rawQuery)) score += 0.50;
        if (desc.contains(rawQuery)) score += 0.25;

        // Token matches
        Set<String> productTokens = tokenize(name + " " + desc + " " + category + " " + sku);

        int directHits = 0;
        int expandedHits = 0;

        for (String qToken : queryTokens) {
            if (name.contains(qToken)) score += 0.30;
            else if (productTokens.contains(qToken)) {
                directHits++;
                score += 0.20;
            }
        }

        for (String expToken : expandedTokens) {
            if (!queryTokens.contains(expToken) && productTokens.contains(expToken)) {
                expandedHits++;
                score += 0.10;
            }
        }

        // In-stock bonus only if there was an actual content match
        if (score > 0 && product.getStockQuantity() > 0) {
            score += 0.05;
        }

        return score;
    }

    private String buildMatchReason(Product product, Set<String> queryTokens, BigDecimal maxPrice) {
        List<String> reasons = new ArrayList<>();

        for (String qToken : queryTokens) {
            if (product.getName().toLowerCase().contains(qToken)) {
                reasons.add("Matches '" + qToken + "' in title");
                break;
            }
        }

        if (reasons.isEmpty() && product.getCategory() != null) {
            reasons.add("Relevant to " + product.getCategory().getName());
        }

        if (maxPrice != null && product.getPrice().compareTo(maxPrice) <= 0) {
            reasons.add("Within budget ($" + product.getPrice() + " <= $" + maxPrice + ")");
        }

        if (reasons.isEmpty()) {
            reasons.add("Semantic semantic match based on product features");
        }

        return String.join(" | ", reasons);
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "with", "from", "that", "this", "are", "you",
            "can", "need", "want", "some", "any", "have", "been", "was", "were",
            "about", "into", "over", "after", "most", "also", "then", "them",
            "what", "when", "where", "which", "who", "why", "how", "all", "our"
    );

    private Set<String> tokenize(String text) {
        if (text == null) return Set.of();
        String[] words = text.toLowerCase(Locale.ROOT).split("[^a-zA-Z0-9]+");
        Set<String> set = new HashSet<>();
        for (String w : words) {
            if (w.length() > 2 && !STOP_WORDS.contains(w)) {
                set.add(w);
            }
        }
        return set;
    }
}
