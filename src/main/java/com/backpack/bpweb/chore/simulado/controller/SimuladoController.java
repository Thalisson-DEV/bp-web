package com.backpack.bpweb.chore.simulado.controller;

import com.backpack.bpweb.chore.simulado.DTOs.GerarSimuladoDTO;
import com.backpack.bpweb.chore.simulado.DTOs.ResultadoSimuladoDTO;
import com.backpack.bpweb.chore.simulado.DTOs.SimuladoResponseDTO;
import com.backpack.bpweb.chore.simulado.DTOs.SubmissaoSimuladoDTO;
import com.backpack.bpweb.chore.simulado.services.SimuladoService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/simulados")
public class SimuladoController {

    @Autowired
    private SimuladoService simuladoService;

    @PostMapping("/gerar")
    public ResponseEntity<?> gerarSimulado(@RequestBody GerarSimuladoDTO request) {
        try {
            SimuladoResponseDTO simulado = simuladoService.gerarSimuladoPorMateria(request.materiaId());
            return ResponseEntity.ok(simulado);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (AuthException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/submeter")
    public ResponseEntity<ResultadoSimuladoDTO> submeterSimulado(@RequestBody SubmissaoSimuladoDTO submissao) throws AuthException {
        try {
            ResultadoSimuladoDTO resultado = simuladoService.corrigirSimulado(submissao);
            return ResponseEntity.ok(resultado);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
