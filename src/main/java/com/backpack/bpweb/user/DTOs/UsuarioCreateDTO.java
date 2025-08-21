package com.backpack.bpweb.user.DTOs;

public record UsuarioCreateDTO(String nomeCompleto, String email, String senha, Integer idade) {
}
