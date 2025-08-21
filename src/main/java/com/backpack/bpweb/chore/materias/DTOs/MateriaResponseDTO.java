package com.backpack.bpweb.chore.materias.DTOs;

import com.backpack.bpweb.chore.materias.entity.Materia;

public record MateriaResponseDTO(
        Integer id,
        String nome
) {
    public MateriaResponseDTO(Materia materia) {
        this(
                materia.getId(),
                materia.getNome()
        );
    }
}
