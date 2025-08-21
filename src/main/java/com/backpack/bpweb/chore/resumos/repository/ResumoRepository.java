package com.backpack.bpweb.chore.resumos.repository;

import com.backpack.bpweb.chore.resumos.entity.Resumo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ResumoRepository extends JpaRepository<Resumo, Integer> {
    Optional<Resumo> findByTitulo(String titulo);

    @Query(
            nativeQuery = true,
            value = "SELECT r.* FROM resumos r " +
                    "LEFT JOIN materias m ON m.id = r.materia_id " +
                    "WHERE (:materiaId IS NULL OR m.id = :materiaId) " +
                    "AND (:searchTerm IS NULL OR LOWER(CAST(r.titulo AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Resumo> findWithFilters(
            @Param("materiaId") Integer materiaId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
