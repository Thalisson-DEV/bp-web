package com.backpack.bpweb.chore.simulado.DTOs;

import java.util.List;

public record QuestaoSimuladoDTO(
        Integer topicoId,
        String tituloTopico,
        List<AlternativaSimplesDTO> alternativas
) {
}
