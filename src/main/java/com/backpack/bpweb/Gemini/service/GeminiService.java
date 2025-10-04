package com.backpack.bpweb.Gemini.service;

import com.backpack.bpweb.Gemini.DTOs.GeminiResponseDTO;
import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasUsuarioDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url}")
    private String geminiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    public GeminiService(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.webClient = builder.build();
        this.objectMapper = objectMapper;
    }

    public String analisarDesempenhoSync(String prompt, EstatisticasUsuarioDTO desempenho) {
        String mensagem = prompt + "\n\n" + desempenho.toString();

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", mensagem)
                        })
                }
        );

        GeminiResponseDTO response = webClient.post()
                .uri(geminiUrl + "?key=" + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponseDTO.class)
                .block();

        return response != null && !response.candidates().isEmpty()
                ? response.candidates().get(0).content().parts().get(0).text()
                : "Sem resposta do modelo";
    }

    public String analisarQuestaoSync(String prompt) {
        String mensagem = prompt;

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", mensagem)
                        })
                }
        );

        GeminiResponseDTO response = webClient.post()
                .uri(geminiUrl + "?key=" + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponseDTO.class)
                .block();

        return response != null && !response.candidates().isEmpty()
                ? response.candidates().get(0).content().parts().get(0).text()
                : "Sem resposta do modelo";
    }

    public Mono<String> analisarDesempenhoAsync(String prompt, EstatisticasUsuarioDTO desempenho) {
        String mensagem = prompt + "\n\n" + desempenho.toString();

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", mensagem)
                        })
                }
        );



        return webClient.post()
                .uri(geminiUrl + "?key=" + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponseDTO.class)
                .map(response -> response.candidates().get(0).content().parts().get(0).text());
    }
}
