package com.backpack.bpweb.progresso.progressoResumo.controller;

import com.backpack.bpweb.progresso.progressoResumo.DTOs.ProgressoResumoResponseDTO;
import com.backpack.bpweb.progresso.progressoResumo.service.ProgressoResumoService;
import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/progresso-resumo")
public class ProgressoResumoController {

    @Autowired
    private ProgressoResumoService progressoResumoService;

    @GetMapping
    public ResponseEntity<List<ProgressoResumoResponseDTO>> getProgressoUsuario() throws AuthException {
        List<ProgressoResumoResponseDTO> progressos = progressoResumoService.buscarProgressoDoUsuarioLogado();
        return ResponseEntity.ok(progressos);
    }

    @PostMapping("/{resumoId}")
    public ResponseEntity<ProgressoResumoResponseDTO> marcarProgresso(@PathVariable Integer resumoId) throws AuthException {
        ProgressoResumoResponseDTO progressoAtualizado = progressoResumoService.marcarProgresso(resumoId);
        return ResponseEntity.ok(progressoAtualizado);
    }
}
