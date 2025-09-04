package com.backpack.bpweb.Gemini.DTOs;

import java.util.List;

public record ContentDTO(
        List<PartDTO> parts,
        String role
) {}
