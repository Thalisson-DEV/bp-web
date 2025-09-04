package com.backpack.bpweb.user.estatistica.DTOs;

public record EstatisticasAulasUsuarioDTO(
        long aulasVistas,
        long aulasPendentes,
        long totalAulas,
        double mediaAulasPorDia
) {
}
