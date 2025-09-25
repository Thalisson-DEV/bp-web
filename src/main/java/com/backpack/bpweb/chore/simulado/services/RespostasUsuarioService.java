package com.backpack.bpweb.chore.simulado.services;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity.Alternativas;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.repository.AlternativasRepository;
import com.backpack.bpweb.chore.simulado.entitys.RespostasUsuario;
import com.backpack.bpweb.chore.simulado.repositorys.RespostasUsuarioRepository;
import com.backpack.bpweb.chore.simulado.entitys.TentativasSimulados;
import com.backpack.bpweb.chore.simulado.repositorys.TentativasSimuladosRepository;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.repository.TopicosQuestoesRepository;
import com.backpack.bpweb.chore.simulado.dto.RespostasUsuarioDTO;
import com.backpack.bpweb.chore.simulado.dto.RespostasUsuarioResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RespostasUsuarioService {
    private final RespostasUsuarioRepository respostasUsuarioRepository;
    private final TopicosQuestoesRepository topicosQuestoesRepository;
    private final TentativasSimuladosRepository tentativasSimuladosRepository;
    private final AlternativasRepository alternativasRepository;

    public RespostasUsuarioService(
            RespostasUsuarioRepository respostasUsuarioRepository,
            TopicosQuestoesRepository topicosQuestoesRepository,
            TentativasSimuladosRepository tentativasSimuladosRepository, AlternativasRepository alternativasRepository) {
        this.respostasUsuarioRepository = respostasUsuarioRepository;
        this.topicosQuestoesRepository = topicosQuestoesRepository;
        this.tentativasSimuladosRepository = tentativasSimuladosRepository;
        this.alternativasRepository = alternativasRepository;
    }

    public List<RespostasUsuarioResponseDTO> findAllRespostas() {
        return respostasUsuarioRepository.findAll().stream()
                .map(RespostasUsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    public RespostasUsuarioResponseDTO findRespostaById(Integer id) {
        RespostasUsuario resposta = respostasUsuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resposta não encontrada com o id: " + id));
        return new RespostasUsuarioResponseDTO(resposta);
    }

    @Transactional
    public RespostasUsuarioResponseDTO createNewResposta(RespostasUsuarioDTO dto) {
        RespostasUsuario resposta = new RespostasUsuario();
        mapDtoToEntity(dto, resposta);
        respostasUsuarioRepository.save(resposta);
        return new RespostasUsuarioResponseDTO(resposta);
    }

    @Transactional
    public RespostasUsuarioResponseDTO updateResposta(Integer id, RespostasUsuarioDTO dto) {
        RespostasUsuario resposta = respostasUsuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resposta não encontrada com o id: " + id));

        mapDtoToEntity(dto, resposta);
        respostasUsuarioRepository.save(resposta);
        return new RespostasUsuarioResponseDTO(resposta);
    }

    @Transactional
    public void deleteResposta(Integer id) {
        if (!respostasUsuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Resposta não encontrada com o id: " + id);
        }
        respostasUsuarioRepository.deleteById(id);
    }

    private void mapDtoToEntity(RespostasUsuarioDTO dto, RespostasUsuario entity) {
        TentativasSimulados tentativa = tentativasSimuladosRepository.findById(dto.tentativa())
                .orElseThrow(() -> new EntityNotFoundException("Tentativa não encontrada com o id: " + dto.tentativa()));

        TopicosQuestoes topico = topicosQuestoesRepository.findById(dto.topico())
                .orElseThrow(() -> new EntityNotFoundException("Tópico não encontrado com o id: " + dto.topico()));

        Alternativas alternativas = alternativasRepository.findById(dto.alternativaEscolhida())
                .orElseThrow(() -> new EntityNotFoundException("Alternativa não encontrado com o id: " + dto.topico()));

        entity.setTentativa(tentativa);
        entity.setTopico(topico);
        entity.setAlternativaEscolhida(alternativas);
        entity.setCorreta(dto.isCorreta());
    }
}
