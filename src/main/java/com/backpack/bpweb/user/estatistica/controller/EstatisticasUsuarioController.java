package com.backpack.bpweb.user.estatistica.controller;

import com.backpack.bpweb.progresso.progressoAula.service.ProgressoAulaService;
import com.backpack.bpweb.progresso.progressoResumo.service.ProgressoResumoService;
import com.backpack.bpweb.user.DTOs.UsuarioResponseDTO;
import com.backpack.bpweb.user.entity.Usuarios;
import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasAulasUsuarioDTO;
import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasResumosUsuarioDTO;
import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasUsuarioDTO;
import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/estatisticas")
public class EstatisticasUsuarioController {

    @Autowired
    private ProgressoAulaService progressoAulaService;
    @Autowired
    private ProgressoResumoService progressoResumoService;

    @GetMapping("/meu-progresso")
    public ResponseEntity<EstatisticasUsuarioDTO> getEstatisticasUsuarioLogado() throws AuthException {
        EstatisticasAulasUsuarioDTO estatisticas = progressoAulaService.calcularEstatisticasDoUsuario();
        EstatisticasResumosUsuarioDTO estatisticasResumosUsuarioDTO = progressoResumoService.calcularEstatisticasDoUsuario();
        Usuarios usuarioLogado = getUsuarioLogado();
        UsuarioResponseDTO usuarioResponseDTO = new UsuarioResponseDTO(usuarioLogado.getNomeCompleto(), usuarioLogado.getEmail(), usuarioLogado.getIdade());
        EstatisticasUsuarioDTO estatisticasUsuarioDTO = new EstatisticasUsuarioDTO(usuarioResponseDTO, estatisticas, estatisticasResumosUsuarioDTO);
        return ResponseEntity.ok(estatisticasUsuarioDTO);
    }

    private Usuarios getUsuarioLogado() throws AuthException {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuarios)) {
            throw new AuthException("Usuário não autenticado ou sessão inválida.");
        }

        return (Usuarios) auth.getPrincipal();
    }
}
