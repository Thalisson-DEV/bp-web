package com.backpack.bpweb.chore.simulado.dto;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs.AlternativasResponseDTO;
import com.backpack.bpweb.chore.simulado.entitys.RespostasUsuario;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs.TopicoQuestaoDTO;

public record RespostasUsuarioResponseDTO(
        Integer id,
        TentativasSimuladosResponseDTO tentativa,
        TopicoQuestaoDTO topico,
        AlternativasResponseDTO alternativaEscolhida,
        Boolean isCorreta
) {
    public RespostasUsuarioResponseDTO(RespostasUsuario respostasUsuario) {
        this(
                respostasUsuario.getId(),
                respostasUsuario.getTentativa() != null ? new TentativasSimuladosResponseDTO(respostasUsuario.getTentativa()) : null,
                respostasUsuario.getTopico() != null ? new TopicoQuestaoDTO(
                        respostasUsuario.getTopico().getTitulo(),
                        respostasUsuario.getTopico().getMateria() != null ? respostasUsuario.getTopico().getMateria().getId() : null,
                        respostasUsuario.getTopico().getNivel()
                ) : null,
                respostasUsuario.getAlternativaEscolhida() != null ? new AlternativasResponseDTO(respostasUsuario.getAlternativaEscolhida()) : null,
                respostasUsuario.isCorreta()
        );
    }
}
