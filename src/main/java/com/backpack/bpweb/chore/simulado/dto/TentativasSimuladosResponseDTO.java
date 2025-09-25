package com.backpack.bpweb.chore.simulado.dto;

import com.backpack.bpweb.chore.simulado.entitys.TentativasSimulados;
import com.backpack.bpweb.user.DTOs.UsuarioResponseDTO;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TentativasSimuladosResponseDTO(
        Integer id,
        UsuarioResponseDTO usuario,
        OffsetDateTime dataInicio,
        OffsetDateTime dataFim,
        BigDecimal pontuacaoFinal
) {
    public TentativasSimuladosResponseDTO(TentativasSimulados tentativasSimulados) {
        this(
                tentativasSimulados.getId(),
                tentativasSimulados.getUsuario() != null ? new UsuarioResponseDTO(
                        tentativasSimulados.getUsuario().getNomeCompleto(),
                        tentativasSimulados.getUsuario().getEmail(),
                        tentativasSimulados.getUsuario().getIdade()
                ) : null,
                tentativasSimulados.getDataInicio(),
                tentativasSimulados.getDataFim(),
                tentativasSimulados.getPontuacaoFinal()
        );
    }
}
