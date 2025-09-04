package com.backpack.bpweb.progresso.progressoResumo.DTOs;

import java.time.OffsetDateTime;

public record ProgressoResumoResponseDTO(
        Integer resumoId,
        OffsetDateTime dataVisualizacao
) {
}
