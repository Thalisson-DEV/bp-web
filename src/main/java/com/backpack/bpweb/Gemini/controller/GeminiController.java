package com.backpack.bpweb.Gemini.controller;

import com.backpack.bpweb.Gemini.DTOs.UserDesempenhoRequestDTO;
import com.backpack.bpweb.Gemini.service.GeminiService;
import com.backpack.bpweb.Gemini.service.PromptBuilderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<String> analisarDesempenhoSync(@RequestBody UserDesempenhoRequestDTO desempenho) {
        String prompt = promptBuilderService.montarPrompt(desempenho.estatisticas());
        String resposta = geminiService.analisarDesempenhoSync(prompt, desempenho.estatisticas());
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/sync/analise-questao")
    public ResponseEntity<String> analisarQuestaoSync(@RequestBody String prompt) {
        String resposta = geminiService.analisarQuestaoSync(prompt);
        return ResponseEntity.ok(resposta);
    }
}
