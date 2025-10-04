package com.backpack.bpweb.chore.simulado.services;

import com.backpack.bpweb.chore.simulado.entitys.TentativasSimulados;
import com.backpack.bpweb.chore.simulado.repositorys.TentativasSimuladosRepository;
import com.backpack.bpweb.chore.simulado.dto.TentativasSimuladosDTO;
import com.backpack.bpweb.chore.simulado.dto.TentativasSimuladosResponseDTO;
import com.backpack.bpweb.user.entity.Usuarios;
import com.backpack.bpweb.user.repositories.UsuariosRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TentativasSimuladosService {
    private final TentativasSimuladosRepository tentativasSimuladosRepository;
    private final UsuariosRepository usuarioRepository;

    public TentativasSimuladosService(
            TentativasSimuladosRepository tentativasSimuladosRepository,
            UsuariosRepository usuarioRepository) {
        this.tentativasSimuladosRepository = tentativasSimuladosRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<TentativasSimuladosResponseDTO> findAllTentativas() {
        return tentativasSimuladosRepository.findAll().stream()
                .map(TentativasSimuladosResponseDTO::new)
                .collect(Collectors.toList());
    }

    public TentativasSimuladosResponseDTO findTentativaById(Integer id) {
        TentativasSimulados tentativa = tentativasSimuladosRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tentativa não encontrada com o id: " + id));
        return new TentativasSimuladosResponseDTO(tentativa);
    }

    public TentativasSimuladosResponseDTO findTentativaByUsuarioId(Integer usuarioId) {
        TentativasSimulados tentativa = tentativasSimuladosRepository.findByUsuarioId(usuarioId);
        if (tentativa == null) {
            throw new EntityNotFoundException("Tentativa não encontrada para o usuário com id: " + usuarioId);
        }
        return new TentativasSimuladosResponseDTO(tentativa);
    }

    public List<TentativasSimuladosResponseDTO> findAllTentativasByUsuarioId(Integer usuarioId) {
        List<TentativasSimulados> tentativas = tentativasSimuladosRepository.findAllByUsuarioIdOrderByDataInicioDesc(usuarioId);
        return tentativas.stream()
                .map(TentativasSimuladosResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<TentativasSimuladosResponseDTO> buscarHistoricoDoUsuarioLogado() throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();
        List<TentativasSimulados> tentativas = tentativasSimuladosRepository.findAllByUsuarioIdOrderByDataInicioDesc(usuarioLogado.getId());
        
        return tentativas.stream()
                .map(TentativasSimuladosResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TentativasSimuladosResponseDTO createNewTentativa(TentativasSimuladosDTO dto) {
        TentativasSimulados tentativa = new TentativasSimulados();
        mapDtoToEntity(dto, tentativa);

        // Se não foi informada a data de início, define para o momento atual
        if (tentativa.getDataInicio() == null) {
            tentativa.setDataInicio(OffsetDateTime.now());
        }

        tentativasSimuladosRepository.save(tentativa);
        return new TentativasSimuladosResponseDTO(tentativa);
    }

    @Transactional
    public TentativasSimuladosResponseDTO updateTentativa(Integer id, TentativasSimuladosDTO dto) {
        TentativasSimulados tentativa = tentativasSimuladosRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tentativa não encontrada com o id: " + id));

        mapDtoToEntity(dto, tentativa);
        tentativasSimuladosRepository.save(tentativa);
        return new TentativasSimuladosResponseDTO(tentativa);
    }

    @Transactional
    public void deleteTentativa(Integer id) {
        if (!tentativasSimuladosRepository.existsById(id)) {
            throw new EntityNotFoundException("Tentativa não encontrada com o id: " + id);
        }
        tentativasSimuladosRepository.deleteById(id);
    }

    private Usuarios getUsuarioLogado() throws AuthException {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuarios)) {
            throw new AuthException("Usuário não autenticado ou sessão inválida.");
        }

        return (Usuarios) auth.getPrincipal();
    }

    private void mapDtoToEntity(TentativasSimuladosDTO dto, TentativasSimulados entity) {
        Usuarios usuario = usuarioRepository.findById(dto.usuario())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o id: " + dto.usuario()));

        entity.setUsuario(usuario);
        entity.setDataInicio(dto.dataInicio());
        entity.setDataFim(dto.dataFim());
        entity.setPontuacaoFinal(dto.pontuacaoFinal());
    }
}
