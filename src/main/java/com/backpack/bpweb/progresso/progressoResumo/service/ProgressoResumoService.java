package com.backpack.bpweb.progresso.progressoResumo.service;

import com.backpack.bpweb.chore.resumos.entity.Resumo;
import com.backpack.bpweb.chore.resumos.repository.ResumoRepository;
import com.backpack.bpweb.progresso.progressoResumo.DTOs.ProgressoResumoResponseDTO;
import com.backpack.bpweb.progresso.progressoResumo.entity.ProgressoResumo;
import com.backpack.bpweb.progresso.progressoResumo.repository.ProgressoResumoRepository;
import com.backpack.bpweb.user.entity.Usuarios;
import com.backpack.bpweb.user.estatistica.DTOs.EstatisticasResumosUsuarioDTO;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProgressoResumoService {

    @Autowired
    private ProgressoResumoRepository repository;
    @Autowired
    private ResumoRepository resumoRepository;

    // Publico
    public List<ProgressoResumoResponseDTO> buscarProgressoDoUsuarioLogado() throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();
        List<ProgressoResumo> progressos = repository.findByUsuario(usuarioLogado);

        return progressos.stream()
                .map(p -> new ProgressoResumoResponseDTO(p.getResumo().getId(), p.getDataLeitura()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProgressoResumoResponseDTO marcarProgresso(Integer resumoId) throws AuthException { // Removemos dataLeitura daqui
        Usuarios usuarioLogado = getUsuarioLogado();
        Resumo resumo = resumoRepository.findById(resumoId)
                .orElseThrow(() -> new EntityNotFoundException("Resumo não encontrado com o id: " + resumoId));

        Optional<ProgressoResumo> progressoExistente = repository.findByUsuarioAndResumo(usuarioLogado, resumo);

        if (progressoExistente.isPresent()) {
            ProgressoResumo progresso = progressoExistente.get();
            return new ProgressoResumoResponseDTO(progresso.getResumo().getId(), progresso.getDataLeitura());
        }

        ProgressoResumo novoProgresso = new ProgressoResumo();
        novoProgresso.setUsuario(usuarioLogado);
        novoProgresso.setResumo(resumo);
        novoProgresso.setDataLeitura(OffsetDateTime.now());

        ProgressoResumo progressoSalvo = repository.save(novoProgresso);

        return new ProgressoResumoResponseDTO(progressoSalvo.getResumo().getId(), progressoSalvo.getDataLeitura());
    }

    public EstatisticasResumosUsuarioDTO calcularEstatisticasDoUsuario() throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();

        long resumosCompletados = repository.countByUsuario(usuarioLogado);
        long totalResumos = resumoRepository.count();
        long resumosPendentes = Math.max(0, totalResumos - resumosCompletados);

        double mediaResumosPorDia = 0.0;
        if (resumosCompletados > 0) {
            List<ProgressoResumo> progressosConcluidos = repository.findByUsuario(usuarioLogado);

            OffsetDateTime primeiraLeitura = progressosConcluidos.stream()
                    .min(Comparator.comparing(ProgressoResumo::getDataLeitura))
                    .get().getDataLeitura();

            OffsetDateTime ultimaLeitura = progressosConcluidos.stream()
                    .max(Comparator.comparing(ProgressoResumo::getDataLeitura))
                    .get().getDataLeitura();

            long diasDeAtividade = ChronoUnit.DAYS.between(primeiraLeitura, ultimaLeitura) + 1;
            mediaResumosPorDia = (double) resumosCompletados / diasDeAtividade;
        }

        return new EstatisticasResumosUsuarioDTO(resumosCompletados, resumosPendentes, totalResumos, mediaResumosPorDia);
    }

    private Usuarios getUsuarioLogado() throws AuthException {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuarios)) {
            throw new AuthException("Usuário não autenticado ou sessão inválida.");
        }

        return (Usuarios) auth.getPrincipal();
    }
}
