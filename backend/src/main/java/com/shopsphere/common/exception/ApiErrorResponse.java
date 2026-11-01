package com.shopsphere.common.exception;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors
) {
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ApiErrorResponse withValidationErrors(int status, String error, String message, String path, Map<String, String> errors) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, errors);
    }
}

