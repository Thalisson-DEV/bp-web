package com.backpack.bpweb.chore.aulas.service;

import com.backpack.bpweb.chore.aulas.DTOs.AulaDTO;
import com.backpack.bpweb.chore.aulas.DTOs.AulaResponseDTO;
import com.backpack.bpweb.chore.aulas.entity.Aula;
import com.backpack.bpweb.chore.aulas.repository.AulaRepository;
import com.backpack.bpweb.chore.materias.entity.Materia;
import com.backpack.bpweb.chore.materias.repository.MateriaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AulaService {

    @Autowired
    private AulaRepository repository;
    @Autowired
    private MateriaRepository materiaRepository;

    // publico
    public Page<AulaResponseDTO> findAulaWithFilters(Integer materiaId, String searchTerm, Pageable pageable) {
        Page<Aula> aulaPage = repository.findWithFilters(materiaId, searchTerm, pageable);

        if (aulaPage.isEmpty()) {
            throw new NullPointerException("Nenhuma aula encontrada com os filtros definidos.");
        }
        return aulaPage.map(AulaResponseDTO::new);
    }

    // publico
    public AulaResponseDTO findAulaById(Integer id) {
        Aula aula = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aula não encontrada."));
        return new AulaResponseDTO(aula);
    }

    // Somente para admins
    public AulaResponseDTO createNewAula(AulaDTO data) {
        if (repository.findByTitulo(data.titulo()).isPresent()) {
            throw new IllegalArgumentException("Já existe uma aula com esse titulo: " + data.titulo());
        }

        Aula aula = new Aula();
        mapDtoToEntity(data, aula);
        repository.save(aula);
        return new AulaResponseDTO(aula);
    }

    // Somente para admins
    public AulaResponseDTO updateAula(Integer id, AulaDTO data) {
        Aula aula = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aula não encontrada com o id: " + id));

        mapDtoToEntity(data, aula);
        repository.save(aula);
        return new AulaResponseDTO(aula);
    }

    // Somente para admins
    public void deleteAula(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Aula não encontrada com o id: " + id);
        }

        repository.deleteById(id);
    }


    private void mapDtoToEntity(AulaDTO dto, Aula entity) {
        Integer materiaId = dto.materia();

        Materia materia = null;
        if (materiaId != null) {
            materia = materiaRepository.findById(materiaId)
                    .orElseThrow(() -> new EntityNotFoundException("Materia não encontrada"));
        }

        entity.setTitulo(dto.titulo());
        entity.setDescricao(dto.descricao());
        entity.setDuracaoSegundos(dto.duracaoSegundos());
        entity.setLink(dto.link());
        entity.setMateriaId(materia);
    }
}
