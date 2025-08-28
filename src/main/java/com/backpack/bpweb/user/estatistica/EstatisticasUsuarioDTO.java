package com.backpack.bpweb.user.estatistica;

public record EstatisticasUsuarioDTO(
        long aulasVistas,
        long aulasPendentes,
        long totalAulas,
        double mediaAulasPorDia
) {
}
