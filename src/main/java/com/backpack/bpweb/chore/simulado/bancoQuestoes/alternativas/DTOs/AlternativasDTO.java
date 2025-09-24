package com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs;

public record AlternativasDTO(
        Integer topico,
        String afirmativa,
        boolean correta,
        String justificativa
) {
}
