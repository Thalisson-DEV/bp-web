package com.backpack.bpweb.chore.resumos.service;

import com.backpack.bpweb.chore.materias.entity.Materia;
import com.backpack.bpweb.chore.materias.repository.MateriaRepository;
import com.backpack.bpweb.chore.resumos.DTOs.ResumoDTO;
import com.backpack.bpweb.chore.resumos.DTOs.ResumoResponseDTO;
import com.backpack.bpweb.chore.resumos.entity.Resumo;
import com.backpack.bpweb.chore.resumos.repository.ResumoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumoService {

    @Autowired
    ResumoRepository repository;
    @Autowired
    MateriaRepository materiaRepository;

    // publico
    public ResumoResponseDTO getResumoById(Integer id) {
        Resumo resumo = repository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Resumo não encontrado com o id: " + id));
        return new ResumoResponseDTO(resumo);
    }

    // Somente para admins
    public ResumoResponseDTO  createResumo(ResumoDTO data) {
        if (repository.findByTitulo(data.titulo()).isPresent()) {
            throw new IllegalArgumentException("Já existe um resumo com esse titulo: " + data.titulo());
        }

        Resumo resumo = new Resumo();
        mapDtoToEntity(data, resumo);
        repository.save(resumo);
        return new ResumoResponseDTO(resumo);
    }

    // Somente para admins
    public ResumoResponseDTO updateResumo(Integer id, ResumoDTO data) {
        Resumo resumo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resumo não encontrado com o id: " + id));

        mapDtoToEntity(data, resumo);
        repository.save(resumo);
        return new ResumoResponseDTO(resumo);
    }

    // Somente para admins
    public void deleteResumo(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Resumo não encontrado com o id: " + id);
        }
        repository.deleteById(id);
    }

    // publico
    public Page<ResumoResponseDTO> findResumoWithFilters(Integer materiaId, String searchTerm, Pageable pageable) {
        Page<Resumo> resumoPage = repository.findWithFilters(materiaId, searchTerm, pageable);
        if (resumoPage.isEmpty()) {
            throw new NullPointerException("Nenhum resumo encontrado com os filtros definidos.");
        }
        return resumoPage.map(ResumoResponseDTO::new);
    }

    // public
    public List<ResumoResponseDTO> findAllResumosByMateriaId(Integer materiaId) {
        List<Resumo> resumos = repository.findAllByMateriaId(materiaId);
        if (resumos.isEmpty()) {
            throw new EntityNotFoundException("Nenhum resumo encontrado com o id da materia informado.");
        }
        return resumos
                .stream()
                .map(ResumoResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Método auxiliar para mapear um DTO para Entity
    private void mapDtoToEntity(ResumoDTO dto, Resumo entity) {
        Integer materiaId = dto.materia();

        Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new EntityNotFoundException("Materia não encontrada"));

        entity.setTitulo(dto.titulo());
        entity.setConteudo(dto.conteudo());
        entity.setMateria(materia);
    }
}
