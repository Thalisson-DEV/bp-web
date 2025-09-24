package com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity.Alternativas;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs.TopicoQuestaoDTO;

public record AlternativasResponseDTO(
        Integer id,
        TopicoQuestaoDTO topico,
        String afirmativa,
        boolean isCorrreta,
        String justificativa
) {
    public AlternativasResponseDTO(Alternativas alternativas) {
        this(
                alternativas.getId(),
                alternativas.getTopicosQuestoes() != null ? new TopicoQuestaoDTO(alternativas.getTopicosQuestoes()) : null,
                alternativas.getTextoAfirmativa(),
                alternativas.isCorreta(),
                alternativas.getJustificativa()
        );
    }
}
