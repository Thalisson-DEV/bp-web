package com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.controller;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs.TopicoQuestaoDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.DTOs.TopicoQuestaoResponseDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.service.TopicosQuestoesService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/topicos")
public class TopicosQuestoesController {

    private final TopicosQuestoesService topicosQuestoesService;

    public TopicosQuestoesController(TopicosQuestoesService topicosQuestoesService) {
        this.topicosQuestoesService = topicosQuestoesService;
    }

    @GetMapping
    public ResponseEntity<List<TopicoQuestaoResponseDTO>> findAllTopicosQuestoes() {
        List<TopicoQuestaoResponseDTO> topicos = topicosQuestoesService.findAllTopicosQuestoes();
        return ResponseEntity.ok(topicos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findByIdTopicosQuestoes(@PathVariable(value = "id") Integer id) {
        try {
            TopicoQuestaoResponseDTO topico = topicosQuestoesService.findByIdTopicosQuestoes(id);
            return ResponseEntity.ok(topico);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createNewTopicoQuestao(@RequestBody TopicoQuestaoDTO data) {
        try {
            TopicoQuestaoResponseDTO topico = topicosQuestoesService.createNewTopicoQuestao(data);
            return ResponseEntity.status(201).body(topico);
        } catch (EntityNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<TopicoQuestaoResponseDTO> updateTopicoQuestao(@PathVariable(value = "id") Integer id, @RequestBody TopicoQuestaoDTO data) {
        try {
            TopicoQuestaoResponseDTO topico = topicosQuestoesService.updateTopicoQuestao(id, data);
            return ResponseEntity.ok(topico);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopicoQuestao(@PathVariable(value = "id") Integer id) {
        try {
            topicosQuestoesService.deleteTopicoQuestao(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
