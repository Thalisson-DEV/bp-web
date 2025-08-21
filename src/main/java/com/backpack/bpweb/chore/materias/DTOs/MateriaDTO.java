package com.backpack.bpweb.chore.materias.DTOs;

import com.backpack.bpweb.chore.materias.entity.Materia;

public record MateriaDTO(
        String nome
) {

    public MateriaDTO(Materia materia) {
        this(materia.getNome());
    }
}
