package com.backpack.bpweb.chore.materias.repository;

import com.backpack.bpweb.chore.materias.entity.Materia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface MateriaRepository extends JpaRepository<Materia, Integer> {

    @Query(
            nativeQuery = true,
            value = "SELECT m.* FROM materias m " +
                    "WHERE (:searchTerm IS NULL OR LOWER(CAST(m.nome AS TEXT)) LIKE LOWER(CONCAT('%', :searchTerm, '%')))"
    )
    Page<Materia> findWithFilters(
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

    Optional<Materia> findByNome(String nome);
}
