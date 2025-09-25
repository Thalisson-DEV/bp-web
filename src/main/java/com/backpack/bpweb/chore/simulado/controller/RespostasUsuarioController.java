package com.backpack.bpweb.chore.simulado.controller;

import com.backpack.bpweb.chore.simulado.dto.RespostasUsuarioDTO;
import com.backpack.bpweb.chore.simulado.dto.RespostasUsuarioResponseDTO;
import com.backpack.bpweb.chore.simulado.services.RespostasUsuarioService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/respostas")
public class RespostasUsuarioController {

    private final RespostasUsuarioService respostasUsuarioService;

    public RespostasUsuarioController(RespostasUsuarioService respostasUsuarioService) {
        this.respostasUsuarioService = respostasUsuarioService;
    }

    @GetMapping
    public ResponseEntity<List<RespostasUsuarioResponseDTO>> getAllRespostas() {
        List<RespostasUsuarioResponseDTO> respostas = respostasUsuarioService.findAllRespostas();
        return ResponseEntity.ok(respostas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RespostasUsuarioResponseDTO> getRespostaById(@PathVariable Integer id) {
        try {
            RespostasUsuarioResponseDTO resposta = respostasUsuarioService.findRespostaById(id);
            return ResponseEntity.ok(resposta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<RespostasUsuarioResponseDTO> createResposta(@RequestBody @Valid RespostasUsuarioDTO dto) {
        try {
            RespostasUsuarioResponseDTO novaResposta = respostasUsuarioService.createNewResposta(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaResposta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RespostasUsuarioResponseDTO> updateResposta(
            @PathVariable Integer id,
            @RequestBody @Valid RespostasUsuarioDTO dto) {
        try {
            RespostasUsuarioResponseDTO respostaAtualizada = respostasUsuarioService.updateResposta(id, dto);
            return ResponseEntity.ok(respostaAtualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResposta(@PathVariable Integer id) {
        try {
            respostasUsuarioService.deleteResposta(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
