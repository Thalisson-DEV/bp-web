package com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;

public record TopicoQuestaoDTO(
    String titulo,
    Integer materia,
    String nivel
) {
    public TopicoQuestaoDTO(TopicosQuestoes topicosQuestoes) {
        this (
                topicosQuestoes.getTitulo(),
                topicosQuestoes.getMateria().getId(),
                topicosQuestoes.getNivel()
        );
    }
}
