package com.backpack.bpweb.user.estatistica.DTOs;

import com.backpack.bpweb.user.DTOs.UsuarioResponseDTO;

public record EstatisticasUsuarioDTO(
        UsuarioResponseDTO usuario,
        EstatisticasAulasUsuarioDTO aulas,
        EstatisticasResumosUsuarioDTO resumos
) {
}
