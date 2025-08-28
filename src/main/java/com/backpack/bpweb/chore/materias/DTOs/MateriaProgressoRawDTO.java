package com.backpack.bpweb.chore.materias.DTOs;

public record MateriaProgressoRawDTO(
        Integer materiaId,
        String materiaNome,
        long totalAulas,
        long aulasConcluidas
) {
    public MateriaProgressoRawDTO(Integer materiaId, String materiaNome, long totalAulas, long aulasConcluidas) {
        this.materiaId = materiaId;
        this.materiaNome = materiaNome;
        this.totalAulas = totalAulas;
        this.aulasConcluidas = aulasConcluidas;
    }
}