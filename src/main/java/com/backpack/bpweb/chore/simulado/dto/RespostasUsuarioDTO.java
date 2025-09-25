package com.backpack.bpweb.chore.simulado.dto;

public record RespostasUsuarioDTO(
        Integer tentativa,
        Integer topico,
        Integer alternativaEscolhida,
        Boolean isCorreta
) {
}
