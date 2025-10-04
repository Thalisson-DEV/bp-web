package com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.repository;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TopicosQuestoesRepository extends JpaRepository<TopicosQuestoes, Integer> {
    Optional<TopicosQuestoes> findByTitulo(String titulo);

    @Query(value = "SELECT * FROM topicos_questoes WHERE materia_id = :materiaId ORDER BY RANDOM()",
            nativeQuery = true)
    List<TopicosQuestoes> findRandomByMateriaId(@Param("materiaId") Integer materiaId, Pageable pageable);

}
