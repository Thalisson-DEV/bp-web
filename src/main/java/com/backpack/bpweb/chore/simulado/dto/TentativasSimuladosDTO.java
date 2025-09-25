package com.backpack.bpweb.chore.simulado.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TentativasSimuladosDTO(
        Integer usuario,
        OffsetDateTime dataInicio,
        OffsetDateTime dataFim,
        BigDecimal pontuacaoFinal
) {
}
