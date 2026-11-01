package com.shopsphere.ai.dto;

public record ChatMessageDto(
        String role, // "user" or "assistant"
        String content
) {
}

