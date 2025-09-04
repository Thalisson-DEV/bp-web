package com.backpack.bpweb.Gemini.DTOs;

import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasUsuarioDTO;

public record UserDesempenhoRequestDTO(
        String prompt,
        EstatisticasUsuarioDTO estatisticas
) {
}
