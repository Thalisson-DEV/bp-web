package com.backpack.bpweb.chore.simulado.DTOs;

import java.util.List;

public record SimuladoResponseDTO(
        Integer tentativaId,
        List<QuestaoSimuladoDTO> questoes
) {
}
