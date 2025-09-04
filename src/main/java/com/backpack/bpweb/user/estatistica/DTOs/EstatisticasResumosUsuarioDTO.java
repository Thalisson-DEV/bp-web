package com.backpack.bpweb.user.estatistica.DTOs;

public record EstatisticasResumosUsuarioDTO(
        long resumosCompletados,
        long resumosPendentes,
        long totalResumos,
        double mediaResumosPorDia
) {
}
