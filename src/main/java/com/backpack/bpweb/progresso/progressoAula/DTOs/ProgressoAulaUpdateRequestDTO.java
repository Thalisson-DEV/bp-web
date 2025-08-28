package com.backpack.bpweb.progresso.progressoAula.DTOs;

import jakarta.validation.constraints.NotBlank;

public record ProgressoAulaUpdateRequestDTO(
        @NotBlank(message = "O status não pode ser vazio.")
        String status
) {}
