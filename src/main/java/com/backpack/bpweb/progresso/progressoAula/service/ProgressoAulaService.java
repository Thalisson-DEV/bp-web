package com.backpack.bpweb.progresso.progressoAula.service;

import com.backpack.bpweb.chore.aulas.entity.Aula;
import com.backpack.bpweb.chore.aulas.repository.AulaRepository;
import com.backpack.bpweb.progresso.progressoAula.DTOs.ProgressoAulaResponseDTO;
import com.backpack.bpweb.progresso.progressoAula.DTOs.ProgressoAulaUpdateRequestDTO;
import com.backpack.bpweb.progresso.progressoAula.entity.ProgressoAula;
import com.backpack.bpweb.progresso.progressoAula.repository.ProgressoAulaRepository;
import com.backpack.bpweb.progresso.progressoAula.statusProgressoAula.entity.StatusProgressoAula;
import com.backpack.bpweb.progresso.progressoAula.statusProgressoAula.repository.StatusProgressoAulaRepository;
import com.backpack.bpweb.user.entity.Usuarios;
import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasAulasUsuarioDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressoAulaService {

    @Autowired
    private ProgressoAulaRepository progressoAulaRepository;
    @Autowired
    private AulaRepository aulaRepository;
    @Autowired
    private StatusProgressoAulaRepository statusProgressoAulaRepository;

    public List<ProgressoAulaResponseDTO> buscarProgressoDoUsuarioLogado() throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();
        List<ProgressoAula> progressos = progressoAulaRepository.findByUsuario(usuarioLogado);

        return progressos.stream()
                .map(p -> new ProgressoAulaResponseDTO(p.getAula().getId(), p.getStatus().getNome()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProgressoAulaUpdateRequestDTO marcarProgresso(Integer aulaId, String statusNome) throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();

        Aula aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> new EntityNotFoundException("Aula não encontrada com o ID: " + aulaId));

        StatusProgressoAula novoStatus = statusProgressoAulaRepository.findByNome(statusNome)
                .orElseThrow(() -> new IllegalArgumentException("Status de progresso inválido: " + statusNome));

        ProgressoAula progresso = progressoAulaRepository.findByUsuarioAndAula(usuarioLogado, aula)
                .orElse(new ProgressoAula(0, usuarioLogado, aula, null, null));

        progresso.setStatus(novoStatus);
        progresso.setDataVisualizacao(OffsetDateTime.now());
        ProgressoAula progressoSalvo = progressoAulaRepository.save(progresso);

        return new ProgressoAulaUpdateRequestDTO(progressoSalvo.getStatus().getNome());
    }

    public EstatisticasAulasUsuarioDTO calcularEstatisticasDoUsuario() throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();

        long aulasVistas = progressoAulaRepository.countByUsuarioAndStatus_nome(usuarioLogado, "CONCLUIDO");
        long totalAulas = aulaRepository.count();
        long aulasPendentes = Math.max(0, totalAulas - aulasVistas);

        double mediaAulasPorDia = 0.0;
        if (aulasVistas > 0) {
            List<ProgressoAula> progressosConcluidos = progressoAulaRepository.findByUsuarioAndStatus_nome(usuarioLogado, "CONCLUIDO");

            OffsetDateTime primeiraVisualizacao = progressosConcluidos.stream()
                    .min(Comparator.comparing(ProgressoAula::getDataVisualizacao))
                    .get().getDataVisualizacao();

            OffsetDateTime ultimaVisualizacao = progressosConcluidos.stream()
                    .max(Comparator.comparing(ProgressoAula::getDataVisualizacao))
                    .get().getDataVisualizacao();

            long diasDeAtividade = ChronoUnit.DAYS.between(primeiraVisualizacao, ultimaVisualizacao) + 1;
            mediaAulasPorDia = (double) aulasVistas / diasDeAtividade;
        }

        return new EstatisticasAulasUsuarioDTO(aulasVistas, aulasPendentes, totalAulas, mediaAulasPorDia);
    }

    private Usuarios getUsuarioLogado() throws AuthException {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuarios)) {
            throw new AuthException("Usuário não autenticado ou sessão inválida.");
        }

        return (Usuarios) auth.getPrincipal();
    }
}
