package com.shopsphere.ai.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record AiChatRequest(
        @NotBlank(message = "message cannot be empty")
        String message,

        List<ChatMessageDto> history
) {
}
