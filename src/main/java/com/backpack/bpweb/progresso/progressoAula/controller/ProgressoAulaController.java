package com.backpack.bpweb.progresso.progressoAula.controller;

import com.backpack.bpweb.progresso.progressoAula.DTOs.ProgressoAulaResponseDTO;
import com.backpack.bpweb.progresso.progressoAula.DTOs.ProgressoAulaUpdateRequestDTO;
import com.backpack.bpweb.progresso.progressoAula.service.ProgressoAulaService;
import jakarta.security.auth.message.AuthException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/progresso")
public class ProgressoAulaController {

    @Autowired
    private ProgressoAulaService progressoService;

    @GetMapping
    public ResponseEntity<List<ProgressoAulaResponseDTO>> getProgressoUsuario() throws AuthException {
        List<ProgressoAulaResponseDTO> progressos = progressoService.buscarProgressoDoUsuarioLogado();
        return ResponseEntity.ok(progressos);
    }

    @PostMapping("/{aulaId}")
    public ResponseEntity<ProgressoAulaUpdateRequestDTO> marcarProgresso(@PathVariable Integer aulaId, @RequestBody @Valid ProgressoAulaUpdateRequestDTO requestDTO) throws AuthException {
        ProgressoAulaUpdateRequestDTO progressoAtualizado = progressoService.marcarProgresso(aulaId, requestDTO.status());
        return ResponseEntity.ok(progressoAtualizado);
    }
}
