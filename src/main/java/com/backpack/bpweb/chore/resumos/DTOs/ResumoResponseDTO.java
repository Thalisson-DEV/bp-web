package com.backpack.bpweb.chore.resumos.DTOs;

import com.backpack.bpweb.chore.materias.DTOs.MateriaDTO;
import com.backpack.bpweb.chore.resumos.entity.Resumo;

public record ResumoResponseDTO(
        Integer id,
        String titulo,
        String conteudo,
        MateriaDTO materia
) {
    public ResumoResponseDTO(Resumo resumo) {
        this(
                resumo.getId(),
                resumo.getTitulo(),
                resumo.getConteudo(),
                resumo.getMateria() != null ? new MateriaDTO(resumo.getMateria()) : null
        );
    }
}
