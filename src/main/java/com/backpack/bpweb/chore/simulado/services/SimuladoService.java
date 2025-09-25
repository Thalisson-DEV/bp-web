package com.backpack.bpweb.chore.simulado.services;

import com.backpack.bpweb.chore.simulado.DTOs.*;
import com.backpack.bpweb.chore.simulado.entitys.RespostasUsuario;
import com.backpack.bpweb.chore.simulado.repositorys.RespostasUsuarioRepository;
import com.backpack.bpweb.chore.simulado.entitys.TentativasSimulados;
import com.backpack.bpweb.chore.simulado.repositorys.TentativasSimuladosRepository;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity.Alternativas;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.repository.AlternativasRepository;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.repository.TopicosQuestoesRepository;
import com.backpack.bpweb.user.entity.Usuarios;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimuladoService {

    private final TopicosQuestoesRepository topicosQuestoesRepository;
    private final AlternativasRepository alternativasRepository;
    private final TentativasSimuladosRepository tentativasSimuladoRepository;
    private final RespostasUsuarioRepository respostasUsuarioRepository;

    public SimuladoService(TopicosQuestoesRepository topicosQuestoesRepository, AlternativasRepository alternativasRepository, TentativasSimuladosRepository tentativasSimuladoRepository, RespostasUsuarioRepository respostasUsuarioRepository) {
        this.topicosQuestoesRepository = topicosQuestoesRepository;
        this.alternativasRepository = alternativasRepository;
        this.tentativasSimuladoRepository = tentativasSimuladoRepository;
        this.respostasUsuarioRepository = respostasUsuarioRepository;
    }



    @Transactional
    public SimuladoResponseDTO gerarSimuladoPorMateria(Integer materiaId) throws AuthException {
        // ETAPA 1: Identificar o usuário e criar a tentativa no banco
        Usuarios usuarioLogado = getUsuarioLogado();

        TentativasSimulados novaTentativa = new TentativasSimulados();
        novaTentativa.setUsuario(usuarioLogado);
        novaTentativa.setDataInicio(OffsetDateTime.now());
        novaTentativa.setPontuacaoFinal(BigDecimal.ZERO); // Pontuação inicial

        // Salva a tentativa para obter um ID. Este ID será enviado ao front-end.
        TentativasSimulados tentativaSalva = tentativasSimuladoRepository.save(novaTentativa);

        // ETAPA 2: Montar as questões para o simulado (sua lógica original)
        final int NUMERO_DE_QUESTOES = 10;
        final int NUMERO_DE_ALTERNATIVAS_INCORRETAS = 4;
        List<TopicosQuestoes> topicosDisponiveis = topicosQuestoesRepository.findRandomByMateriaId(materiaId, PageRequest.of(0, 50));

        if (topicosDisponiveis.size() < NUMERO_DE_QUESTOES) {
            throw new IllegalStateException("Não há tópicos suficientes para gerar um simulado de " + NUMERO_DE_QUESTOES + " questões.");
        }

        List<QuestaoSimuladoDTO> questoesDoSimulado = new ArrayList<>();

        for (TopicosQuestoes topico : topicosDisponiveis) {
            if (questoesDoSimulado.size() >= NUMERO_DE_QUESTOES) {
                break;
            }

            // Presumindo que os métodos no repositório foram ajustados para serem explícitos
            Optional<Alternativas> corretaOpt = alternativasRepository.findByTopicosQuestoes_IdAndCorretaIsTrue(topico.getId());
            List<Alternativas> incorretas = alternativasRepository.findIncorrectAlternativesRandomly(topico.getId(), NUMERO_DE_ALTERNATIVAS_INCORRETAS);

            if (corretaOpt.isPresent() && incorretas.size() >= NUMERO_DE_ALTERNATIVAS_INCORRETAS) {
                List<Alternativas> alternativasDaQuestao = new ArrayList<>(incorretas);
                alternativasDaQuestao.add(corretaOpt.get());
                Collections.shuffle(alternativasDaQuestao);

                List<AlternativaSimplesDTO> alternativasDTO = alternativasDaQuestao.stream()
                        .map(alt -> new AlternativaSimplesDTO(alt.getId(), alt.getTextoAfirmativa()))
                        .collect(Collectors.toList());

                questoesDoSimulado.add(new QuestaoSimuladoDTO(topico.getId(), topico.getTitulo(), alternativasDTO));
            }
        }

        if (questoesDoSimulado.size() < NUMERO_DE_QUESTOES) {
            // Se a exceção for lançada, @Transactional desfaz a criação da tentativa.
            throw new IllegalStateException("Não foi possível montar " + NUMERO_DE_QUESTOES + " questões válidas.");
        }

        // ETAPA 3: Retornar o ID da tentativa junto com as questões
        return new SimuladoResponseDTO(tentativaSalva.getId(), questoesDoSimulado);
    }

    /**
     * Corrige um simulado submetido pelo usuário.
     * Este método BUSCA a tentativa criada pelo método 'gerarSimuladoPorMateria'.
     */
    @Transactional
    public ResultadoSimuladoDTO corrigirSimulado(SubmissaoSimuladoDTO submissao) throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();

        // Busca a tentativa, lançando uma exceção clara se não for encontrada (ou não pertencer ao usuário)
        TentativasSimulados tentativa = tentativasSimuladoRepository
                .findByIdAndUsuarioId(submissao.tentativaId(), usuarioLogado.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tentativa com ID " + submissao.tentativaId() + " não encontrada ou não pertence ao usuário."
                ));

        List<QuestaoCorrigidaDTO> questoesCorrigidas = new ArrayList<>();
        int acertos = 0;

        for (Map.Entry<Integer, Integer> respostaEntry : submissao.respostas().entrySet()) {
            Integer topicoId = respostaEntry.getKey();
            Integer alternativaEscolhidaId = respostaEntry.getValue();

            TopicosQuestoes topico = topicosQuestoesRepository.findById(topicoId)
                    .orElseThrow(() -> new EntityNotFoundException("Tópico não encontrado: " + topicoId));
            Alternativas alternativaEscolhida = alternativasRepository.findById(alternativaEscolhidaId)
                    .orElseThrow(() -> new EntityNotFoundException("Alternativa não encontrada: " + alternativaEscolhidaId));

            Alternativas alternativaCorreta = alternativasRepository.findByTopicosQuestoes_IdAndCorretaIsTrue(topicoId)
                    .orElseThrow(() -> new IllegalStateException("Tópico sem alternativa correta: " + topicoId));

            boolean acertou = alternativaEscolhida.isCorreta();
            if (acertou) {
                acertos++;
            }

            RespostasUsuario resposta = new RespostasUsuario();
            resposta.setTentativa(tentativa);
            resposta.setTopico(topico);
            resposta.setAlternativaEscolhida(alternativaEscolhida);
            resposta.setCorreta(acertou);
            respostasUsuarioRepository.save(resposta);

            questoesCorrigidas.add(new QuestaoCorrigidaDTO(
                    topicoId,
                    topico.getTitulo(),
                    alternativaEscolhidaId,
                    alternativaEscolhida.getTextoAfirmativa(),
                    alternativaCorreta.getId(),
                    alternativaCorreta.getTextoAfirmativa(),
                    acertou,
                    alternativaCorreta.getJustificativa()
            ));
        }

        double pontuacao = (submissao.respostas().isEmpty()) ? 0.0 : ((double) acertos / submissao.respostas().size()) * 100.0;

        // Atualiza e finaliza a tentativa
        tentativa.setDataFim(OffsetDateTime.now());
        tentativa.setPontuacaoFinal(BigDecimal.valueOf(pontuacao));
        tentativasSimuladoRepository.save(tentativa);

        return new ResultadoSimuladoDTO(tentativa.getId(), pontuacao, acertos, submissao.respostas().size(), questoesCorrigidas);
    }

    private Usuarios getUsuarioLogado() throws AuthException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuarios)) {
            throw new AuthException("Usuário não autenticado ou sessão inválida.");
        }
        return (Usuarios) auth.getPrincipal();
    }

}
