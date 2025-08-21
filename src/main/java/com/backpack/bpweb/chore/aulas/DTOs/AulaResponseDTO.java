package com.backpack.bpweb.chore.aulas.DTOs;

import com.backpack.bpweb.chore.aulas.entity.Aula;
import com.backpack.bpweb.chore.materias.DTOs.MateriaDTO;

public record AulaResponseDTO(
        Integer id,
        String titulo,
        String descricao,
        String link,
        Integer duracaoSegundos,
        MateriaDTO materia
) {

    public AulaResponseDTO(Aula aula) {
        this(
                aula.getId(),
                aula.getTitulo(),
                aula.getDescricao(),
                aula.getLink(),
                aula.getDuracaoSegundos(),
                aula.getMateriaId() != null ? new MateriaDTO(aula.getMateriaId()) : null
        );
    }
}
