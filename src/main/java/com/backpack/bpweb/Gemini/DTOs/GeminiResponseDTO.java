package com.backpack.bpweb.Gemini.DTOs;

import java.util.List;

public record GeminiResponseDTO(
        List<CandidateDTO> candidates,
        UsageMetadataDTO usageMetadata,
        String modelVersion,
        String responseId
) {
}
