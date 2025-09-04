package com.backpack.bpweb.Gemini.DTOs;

public record CandidateDTO(
        ContentDTO content,
        String finishReason,
        double avgLogprobs
) {
}
