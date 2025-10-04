package com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.service;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs.TopicoQuestaoDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs.TopicoQuestaoResponseDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.repository.TopicosQuestoesRepository;
import com.backpack.bpweb.chore.materias.entity.Materia;
import com.backpack.bpweb.chore.materias.repository.MateriaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopicosQuestoesService {

    private final TopicosQuestoesRepository topicosQuestoesRepository;
    private final MateriaRepository materiaRepository;
    // merma coisa do autowired
    public TopicosQuestoesService(TopicosQuestoesRepository topicosQuestoesRepository, MateriaRepository materiaRepository) {
        this.topicosQuestoesRepository = topicosQuestoesRepository;
        this.materiaRepository = materiaRepository;
    }

    // publico
    public List<TopicoQuestaoResponseDTO> findAllTopicosQuestoes() {
        return topicosQuestoesRepository.findAll().stream()
                .map(TopicoQuestaoResponseDTO::new)
                .collect(Collectors.toList());
    }

    // publico
    public TopicoQuestaoResponseDTO findByIdTopicosQuestoes(Integer id) {
        TopicosQuestoes topico = topicosQuestoesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topico não encontrado com o id: " + id));
        return new TopicoQuestaoResponseDTO(topico);
    }

    @Transactional
    public TopicoQuestaoResponseDTO createNewTopicoQuestao(TopicoQuestaoDTO data) {
        if (!materiaRepository.existsById(data.materia())) {
            throw new EntityNotFoundException("materia não encontrado com o id: " + data.materia());
        }
        if (topicosQuestoesRepository.findByTitulo(data.titulo()).isPresent()) {
            throw new IllegalArgumentException("Já existe um topico com esse titulo: " + data.titulo());
        }

        TopicosQuestoes topico = new TopicosQuestoes();
        mapDtoToEntity(data, topico);
        topicosQuestoesRepository.save(topico);
        return new TopicoQuestaoResponseDTO(topico);
    }

    @Transactional
    public TopicoQuestaoResponseDTO updateTopicoQuestao(Integer id, TopicoQuestaoDTO data) {
        TopicosQuestoes topico = topicosQuestoesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topico não encontrado com o id: " + id));

        mapDtoToEntity(data, topico);
        topicosQuestoesRepository.save(topico);
        return new TopicoQuestaoResponseDTO(topico);
    }

    @Transactional
    public void deleteTopicoQuestao(Integer id) {
        if (!topicosQuestoesRepository.existsById(id)) {
            throw new EntityNotFoundException("Topico não encontrado com o id: " + id);
        }
        topicosQuestoesRepository.deleteById(id);
    }

    private void mapDtoToEntity(TopicoQuestaoDTO dto, TopicosQuestoes entity) {
        Materia materia = materiaRepository.findById(dto.materia())
                .orElseThrow(() -> new EntityNotFoundException("Materia não encontrada com o id: " + dto.materia()));

        entity.setTitulo(dto.titulo());
        entity.setMateria(materia);
        entity.setNivel(dto.nivel());
    }
}
