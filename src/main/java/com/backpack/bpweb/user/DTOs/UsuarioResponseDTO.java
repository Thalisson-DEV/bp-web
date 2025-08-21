package com.backpack.bpweb.user.DTOs;

public record UsuarioResponseDTO(
        String nomeCompleto,
        String email,
        Integer idade
) {
}
