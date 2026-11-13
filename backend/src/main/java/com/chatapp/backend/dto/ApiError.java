package com.chatapp.backend.dto;

import java.time.Instant;

public record ApiError(int status, String error, String message, String path, Instant timestamp) {

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, Instant.now());
    }

    public String toJson() {
        return "{\"status\":" + status
                + ",\"error\":" + quote(error)
                + ",\"message\":" + quote(message)
                + ",\"path\":" + quote(path)
                + ",\"timestamp\":" + quote(timestamp.toString()) + "}";
    }

    private static String quote(String value) {
        if (value == null) {
            return "null";
        }
        StringBuilder sb = new StringBuilder("\"");
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.append('"').toString();
    }
}
