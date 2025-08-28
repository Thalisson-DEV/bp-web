package com.backpack.bpweb.user.estatistica;

import com.backpack.bpweb.progresso.progressoAula.service.ProgressoAulaService;
import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/estatisticas")
public class EstatisticasUsuarioController {

    @Autowired
    private ProgressoAulaService progressoAulaService;

    @GetMapping("/meu-progresso")
    public ResponseEntity<EstatisticasUsuarioDTO> getEstatisticasUsuarioLogado() throws AuthException {
        EstatisticasUsuarioDTO estatisticas = progressoAulaService.calcularEstatisticasDoUsuario();
        return ResponseEntity.ok(estatisticas);
    }
}
