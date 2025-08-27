package com.backpack.bpweb.chore.aulas.repository;

import com.backpack.bpweb.chore.aulas.entity.Aula;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AulaRepository extends JpaRepository<Aula, Integer> {

    @Query(
            nativeQuery = true,
            value = "SELECT a.* FROM aulas a " +
                    "LEFT JOIN materias m ON m.id = a.materia_id " +
                    "WHERE (:materiaId IS NULL OR m.id = :materiaId) " +
                    "AND (:searchTerm IS NULL OR LOWER(CAST(a.titulo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(CAST(a.descricao AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Aula> findWithFilters(
            @Param("materiaId") Integer materiaId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

    Optional<Aula> findByTitulo(String titulo);

    List<Aula> findAllByMateriaId(Integer materiaId);
}
