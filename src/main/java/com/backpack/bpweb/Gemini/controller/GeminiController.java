package com.backpack.bpweb.Gemini.controller;

import com.backpack.bpweb.Gemini.DTOs.UserDesempenhoRequestDTO;
import com.backpack.bpweb.Gemini.service.GeminiService;
import com.backpack.bpweb.Gemini.service.PromptBuilderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/ai/gemini")
public class GeminiController {

    private final GeminiService geminiService;
    private final PromptBuilderService promptBuilderService;

    public GeminiController(GeminiService geminiService, PromptBuilderService promptBuilderService) {
        this.geminiService = geminiService;
        this.promptBuilderService = promptBuilderService;
    }


    @GetMapping("/async/desempenho")
    public ResponseEntity<Mono<String>> analisarDesempenhoAsync(@RequestBody UserDesempenhoRequestDTO desempenho) {
        String prompt = promptBuilderService.montarPrompt(desempenho.estatisticas());
        Mono<String> resposta = geminiService.analisarDesempenhoAsync(prompt, desempenho.estatisticas());
        return ResponseEntity.ok(resposta);
    }
}
