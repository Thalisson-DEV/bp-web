package com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.repository;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity.Alternativas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlternativasRepository extends JpaRepository<Alternativas, Integer> {
    List<Alternativas> findByTopicosQuestoes_Id(int topicosQuestoesId);

    Optional<Alternativas> findByTextoAfirmativa(String textoAfirmativa);

    Optional<Alternativas> findByTopicosQuestoes_IdAndCorretaIsTrue(int topicosQuestoesId);

    Optional<Alternativas> findById(int id);

    /**
     * Busca UMA alternativa correta aleatoriamente para um dado tópico.
     * Usa Query Nativa para a função RANDOM() do PostgreSQL.
     */
    @Query(value = "SELECT * FROM alternativas WHERE topico_id = :topicoId AND eh_correta = true ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Alternativas> findCorrectAlternativeRandomly(@Param("topicoId") Integer topicoId);

    /**
     * Busca um número específico de alternativas incorretas aleatoriamente para um dado tópico.
     * Usa Query Nativa para a função RANDOM() do PostgreSQL.
     */
    @Query(value = "SELECT * FROM alternativas WHERE topico_id = :topicoId AND eh_correta = false ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Alternativas> findIncorrectAlternativesRandomly(@Param("topicoId") Integer topicoId, @Param("limit") int limit);

    List<Alternativas> findByTextoAfirmativaIn(List<String> textos);
}
