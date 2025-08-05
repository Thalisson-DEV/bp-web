package com.backpack.bpweb.dtos;

import com.backpack.bpweb.models.Usuarios;

public record LoginResponseDTO(String token, Usuarios user) {
}
