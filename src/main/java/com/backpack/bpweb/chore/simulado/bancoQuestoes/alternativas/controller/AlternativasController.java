package com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.controller;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.service.AlternativasService;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs.AlternativasDTO;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.DTOs.AlternativasResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AlternativasController {

    private final AlternativasService alternativasService;

    public AlternativasController(AlternativasService alternativasService) {
        this.alternativasService = alternativasService;
    }

    @PostMapping("/topicos/{topicoId}/alternativas")
    public ResponseEntity<?> createNewAlternativa(@PathVariable(value = "topicoId") Integer topicoId, @RequestBody AlternativasDTO dto) {
        try {
            AlternativasResponseDTO novaAlternativa = alternativasService.createNewAlternativa(dto);
            return ResponseEntity.status(201).body(novaAlternativa);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/topicos/alternativas/batch")
    public ResponseEntity<?> createMultipleAlternativas(@RequestBody List<AlternativasDTO> dtos) {
        try {
            List<AlternativasResponseDTO> novasAlternativas = alternativasService.createMultipleAlternativas(dtos);
            return ResponseEntity.status(201).body(novasAlternativas);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/topicos/{topicoId}/alternativas")
    public ResponseEntity<List<AlternativasResponseDTO>> getAllAlternativasByTopicoId(@PathVariable(value = "topicoId") Integer topicoId) {
        List<AlternativasResponseDTO> alternativas = alternativasService.findAllAlternativasByTopico(topicoId);
        return ResponseEntity.ok(alternativas);
    }

    @PutMapping("/alternativas/{id}")
    public ResponseEntity<AlternativasResponseDTO> updateAlternativa(@PathVariable Integer id, @RequestBody AlternativasDTO dto) {
        try {
            AlternativasResponseDTO alternativa = alternativasService.updateAlternativa(id, dto);
            return ResponseEntity.ok(alternativa);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/alternativas/{id}")
    public ResponseEntity<Void> deleteAlternativa(@PathVariable Integer id) {
        try {
            alternativasService.deleteAlternativa(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
