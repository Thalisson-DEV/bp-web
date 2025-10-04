package com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import com.backpack.bpweb.chore.materias.DTOs.MateriaDTO;

public record TopicoQuestaoResponseDTO(
        Integer id,
        String titulo,
        MateriaDTO materia,
        String nivel
) {
    public TopicoQuestaoResponseDTO(TopicosQuestoes topicosQuestoes) {
        this(
                topicosQuestoes.getId(),
                topicosQuestoes.getTitulo(),
                topicosQuestoes.getMateria() != null ? new MateriaDTO(topicosQuestoes.getMateria()) : null,
                topicosQuestoes.getNivel()
        );
    }
}
