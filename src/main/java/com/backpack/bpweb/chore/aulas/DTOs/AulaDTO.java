package com.backpack.bpweb.chore.aulas.DTOs;

public record AulaDTO(
        String titulo,
        String descricao,
        String link,
        Integer duracaoSegundos,
        Integer materia
) {
}
