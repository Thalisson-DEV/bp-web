package com.backpack.bpweb.chore.simulado.DTOs;

import java.util.Map;

public record SubmissaoSimuladoDTO(
        Integer tentativaId, // O ID da tentativa que foi iniciada
        Map<Integer, Integer> respostas // Mapa de {topicoId, alternativaEscolhidaId}
) {}
