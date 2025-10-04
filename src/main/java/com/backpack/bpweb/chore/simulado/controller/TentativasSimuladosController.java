package com.backpack.bpweb.chore.simulado.controller;

import com.backpack.bpweb.chore.simulado.dto.TentativasSimuladosDTO;
import com.backpack.bpweb.chore.simulado.dto.TentativasSimuladosResponseDTO;
import com.backpack.bpweb.chore.simulado.services.TentativasSimuladosService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tentativas-simulados")
public class TentativasSimuladosController {

    private final TentativasSimuladosService tentativasSimuladosService;

    public TentativasSimuladosController(TentativasSimuladosService tentativasSimuladosService) {
        this.tentativasSimuladosService = tentativasSimuladosService;
    }

    @GetMapping
    public ResponseEntity<List<TentativasSimuladosResponseDTO>> getAllTentativas() {
        List<TentativasSimuladosResponseDTO> tentativas = tentativasSimuladosService.findAllTentativas();
        return ResponseEntity.ok(tentativas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TentativasSimuladosResponseDTO> getTentativaById(@PathVariable Integer id) {
        try {
            TentativasSimuladosResponseDTO tentativa = tentativasSimuladosService.findTentativaById(id);
            return ResponseEntity.ok(tentativa);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<TentativasSimuladosResponseDTO> getTentativaByUsuarioId(@PathVariable Integer usuarioId) {
        try {
            TentativasSimuladosResponseDTO tentativa = tentativasSimuladosService.findTentativaByUsuarioId(usuarioId);
            return ResponseEntity.ok(tentativa);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/meu-historico")
    public ResponseEntity<List<TentativasSimuladosResponseDTO>> getMeuHistorico() throws AuthException {
        List<TentativasSimuladosResponseDTO> historico = tentativasSimuladosService.buscarHistoricoDoUsuarioLogado();
        return ResponseEntity.ok(historico);
    }

    @PostMapping
    public ResponseEntity<TentativasSimuladosResponseDTO> createTentativa(@RequestBody @Valid TentativasSimuladosDTO dto) {
        try {
            TentativasSimuladosResponseDTO novaTentativa = tentativasSimuladosService.createNewTentativa(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaTentativa);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TentativasSimuladosResponseDTO> updateTentativa(
            @PathVariable Integer id,
            @RequestBody @Valid TentativasSimuladosDTO dto) {
        try {
            TentativasSimuladosResponseDTO tentativaAtualizada = tentativasSimuladosService.updateTentativa(id, dto);
            return ResponseEntity.ok(tentativaAtualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTentativa(@PathVariable Integer id) {
        try {
            tentativasSimuladosService.deleteTentativa(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
