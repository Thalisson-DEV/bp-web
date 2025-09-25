package com.backpack.bpweb.chore.simulado.DTOs;

public record QuestaoCorrigidaDTO(
        Integer topicoId,
        String tituloTopico,
        Integer alternativaEscolhidaId,
        String textoAlternativaEscolhida,
        Integer alternativaCorretaId,
        String textoAlternativaCorreta,
        boolean acertou,
        String justificativa // A justificativa da alternativa CORRETA
) {}