package com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.service;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs.AlternativasDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs.AlternativasResponseDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity.Alternativas;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.repository.AlternativasRepository;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.repository.TopicosQuestoesRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AlternativasService {
    private final AlternativasRepository alternativasRepository;
    private final TopicosQuestoesRepository topicosQuestoesRepository;

    public AlternativasService(AlternativasRepository alternativasRepository, TopicosQuestoesRepository topicosQuestoesRepository) {
        this.alternativasRepository = alternativasRepository;
        this.topicosQuestoesRepository = topicosQuestoesRepository;
    }

    // privado
    @Transactional
    public AlternativasResponseDTO createNewAlternativa(AlternativasDTO dto) {
        if (!topicosQuestoesRepository.existsById(dto.topico())) {
            throw new EntityNotFoundException("Topico não encontrado com o id: " + dto.topico());
        }
        if (alternativasRepository.findByTextoAfirmativa(dto.afirmativa()).isPresent()) {
            throw new IllegalArgumentException("Já existe uma alternativa com esse texto: " + dto.afirmativa());
        }

        Alternativas novaAlternativa = new Alternativas();
        mapDtoToEntity(dto, novaAlternativa);
        alternativasRepository.save(novaAlternativa);
        return new AlternativasResponseDTO(novaAlternativa);
    }

    @Transactional
    public List<AlternativasResponseDTO> createMultipleAlternativas(List<AlternativasDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }

        // --- OTIMIZAÇÃO 1: Validar todas as afirmativas de uma só vez ---
        // 1. Extrai todos os textos das afirmativas da lista de DTOs.
        List<String> textosAfirmativas = dtos.stream().map(AlternativasDTO::afirmativa).collect(Collectors.toList());

        // 2. Faz UMA ÚNICA consulta ao banco para ver se alguma delas já existe.
        List<Alternativas> existentes = alternativasRepository.findByTextoAfirmativaIn(textosAfirmativas);
        if (!existentes.isEmpty()) {
            throw new IllegalArgumentException("Uma ou mais alternativas já existem no banco de dados. Ex: '" + existentes.getFirst().getTextoAfirmativa() + "'");
        }

        // --- OTIMIZAÇÃO 2: Buscar todos os tópicos necessários de uma só vez ---
        // 3. Extrai todos os IDs de tópicos únicos da lista de DTOs.
        Set<Integer> topicoIds = dtos.stream().map(AlternativasDTO::topico).collect(Collectors.toSet());

        // 4. Faz UMA ÚNICA consulta ao banco para buscar todos os tópicos necessários.
        List<TopicosQuestoes> topicosEncontrados = topicosQuestoesRepository.findAllById(topicoIds);

        // 5. Converte a lista de tópicos em um Mapa para acesso instantâneo (ID -> Objeto Tópico).
        Map<Integer, TopicosQuestoes> topicosMap = topicosEncontrados.stream()
                .collect(Collectors.toMap(TopicosQuestoes::getId, topico -> topico));

        // Valida se todos os tópicos enviados existem no banco.
        if (topicosMap.size() != topicoIds.size()) {
            throw new EntityNotFoundException("Um ou mais IDs de tópicos fornecidos não foram encontrados no banco de dados.");
        }

        // --- LÓGICA PRINCIPAL CORRIGIDA ---
        // 6. Prepara a lista de novas entidades para salvar.
        List<Alternativas> alternativasToSave = new ArrayList<>();
        for (AlternativasDTO dto : dtos) {

            // 7. CORREÇÃO: Busca o tópico no Mapa (operação em memória, sem acesso ao banco!)
            TopicosQuestoes topico = topicosMap.get(dto.topico());

            // 8. Mapeia os dados do DTO para a nova entidade.
            Alternativas novaAlternativa = new Alternativas();
            novaAlternativa.setTopicosQuestoes(topico);
            novaAlternativa.setTextoAfirmativa(dto.afirmativa());
            novaAlternativa.setCorreta(dto.correta());
            novaAlternativa.setJustificativa(dto.justificativa());

            alternativasToSave.add(novaAlternativa);
        }

        // 9. Salva todas as novas alternativas em UMA ÚNICA operação de lote.
        List<Alternativas> savedAlternativas = alternativasRepository.saveAll(alternativasToSave);

        // 10. Mapeia as entidades salvas para DTOs de resposta.
        return savedAlternativas.stream()
                .map(AlternativasResponseDTO::new)
                .collect(Collectors.toList());
    }
    // publico
    public List<AlternativasResponseDTO> findAllAlternativasByTopico(Integer topicoId) {
        if (!topicosQuestoesRepository.existsById(topicoId)) {
            throw new EntityNotFoundException("Topico não encontrado com o id: " + topicoId);
        }
        return alternativasRepository.findByTopicosQuestoes_Id(topicoId).stream()
                .map(AlternativasResponseDTO::new)
                .collect(Collectors.toList());
    }

    // privado
    @Transactional
    public AlternativasResponseDTO updateAlternativa(Integer id, AlternativasDTO data) {
        Alternativas alternativaExistente = alternativasRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alternativa nao encontrada com o id: " + id));

        mapDtoToEntity(data, alternativaExistente);
        alternativasRepository.save(alternativaExistente);
        return new AlternativasResponseDTO(alternativaExistente);
    }

    @Transactional
    public void deleteAlternativa(Integer id) {
        if (!alternativasRepository.existsById(id)) {
            throw new EntityNotFoundException("Alternativa nao encontrada com o id: " + id);
        }
        alternativasRepository.deleteById(id);
    }


    private void mapDtoToEntity(AlternativasDTO dto, Alternativas entity) {
        TopicosQuestoes topico = topicosQuestoesRepository.findById(dto.topico())
                .orElseThrow(() -> new EntityNotFoundException("Topico não encontrado com o id: " + dto.topico()));

        entity.setTopicosQuestoes(topico);
        entity.setTextoAfirmativa(dto.afirmativa());
        entity.setCorreta(dto.correta());
        entity.setJustificativa(dto.justificativa());
    }

    private void mapDtosToEntitys(AlternativasDTO dto, Alternativas entity, TopicosQuestoes topico) {
        entity.setTopicosQuestoes(topico);
        entity.setTextoAfirmativa(dto.afirmativa());
        entity.setCorreta(dto.correta());
        entity.setJustificativa(dto.justificativa());
    }
}
