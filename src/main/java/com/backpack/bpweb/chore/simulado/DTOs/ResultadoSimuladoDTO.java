package com.backpack.bpweb.chore.simulado.DTOs;

import java.util.List;

public record ResultadoSimuladoDTO(
        Integer tentativaId,
        double pontuacaoFinal,
        int acertos,
        int totalQuestoes,
        List<QuestaoCorrigidaDTO> questoesCorrigidas
) {}
