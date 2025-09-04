package com.backpack.bpweb.Gemini.DTOs;

public record UsageMetadataDTO(
        int promptTokenCount,
        int candidatesTokenCount,
        int totalTokenCount
) {}