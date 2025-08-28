package com.backpack.bpweb.chore.materias.service;

import com.backpack.bpweb.chore.materias.DTOs.MateriaComConclusaoDTO;
import com.backpack.bpweb.chore.materias.DTOs.MateriaDTO;
import com.backpack.bpweb.chore.materias.DTOs.MateriaProgressoRawDTO;
import com.backpack.bpweb.chore.materias.DTOs.MateriaResponseDTO;
import com.backpack.bpweb.chore.materias.entity.Materia;
import com.backpack.bpweb.chore.materias.repository.MateriaRepository;
import com.backpack.bpweb.user.entity.Usuarios;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    // Publico
    public MateriaResponseDTO getMateriaById(Integer id) {
        Materia materia = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Matéria não encontrada com o id: " + id));

        return new MateriaResponseDTO(materia);
    }

    // Somente para Admins
    public MateriaResponseDTO createMateria(MateriaDTO data) {
        if (repository.findByNome(data.nome()).isPresent()) {
            throw new IllegalArgumentException("Já existe uma Matéria com esse nome: " + data.nome());
        }

        Materia materia = new Materia();
        mapDtoToEntity(data, materia);
        repository.save(materia);
        return new MateriaResponseDTO(materia);
    }

    // Somente para Admins
    public MateriaResponseDTO updateMateria(Integer id, MateriaDTO data) {
        Materia materia = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Matéria não encontrada com o id: " + id));

        mapDtoToEntity(data, materia);
        repository.save(materia);
        return new MateriaResponseDTO(materia);
    }

    // Somente para Admins
    public void deleteMateria(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Matéria não encontrada com o id: " + id);
        }
        repository.deleteById(id);
    }

    // Publico
    public Page<MateriaResponseDTO> findMateriasWithFilters(String searchTerm, Integer materiaId, Pageable pageable) {
        Page<Materia> materiaPage = repository.findWithFilters(searchTerm, materiaId, pageable);
        if (materiaPage.isEmpty()) {
            throw new NullPointerException("Nenhuma matéria encontrada com os filtros definidos.");
        }

        return materiaPage.map(MateriaResponseDTO::new);
    }

    // Publico
    public List<MateriaComConclusaoDTO> buscarMateriasComProgresso() throws AuthException {
        Usuarios usuarioLogado = getUsuarioLogado();

        List<MateriaProgressoRawDTO> rawData = repository.findMateriasWithProgress(usuarioLogado);

        return rawData.stream()
                .map(raw -> {
                    double percentual = 0.0;
                    if (raw.totalAulas() > 0) {
                        percentual = ((double) raw.aulasConcluidas() / raw.totalAulas()) * 100.0;
                    }
                    return new MateriaComConclusaoDTO(
                            raw.materiaId(),
                            raw.materiaNome(),
                            percentual
                    );
                })
                .collect(Collectors.toList());
    }

    private Usuarios getUsuarioLogado() throws AuthException {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuarios)) {
            throw new AuthException("Usuário não autenticado ou sessão inválida.");
        }

        return (Usuarios) auth.getPrincipal();
    }

    private void mapDtoToEntity(MateriaDTO dto, Materia entity) {
        entity.setNome(dto.nome());
    }
}
