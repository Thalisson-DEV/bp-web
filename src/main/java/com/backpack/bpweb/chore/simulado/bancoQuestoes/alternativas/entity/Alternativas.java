package com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "Alternativas")
@Table(name = "alternativas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Alternativas {

    // Entity que serve como as proprias alternativas de uma questao
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topico_id")
    private TopicosQuestoes topicosQuestoes;
    @Column(name = "texto_afirmativa", nullable = false)
    private String textoAfirmativa;
    @Column(name = "eh_correta", nullable = false)
    private boolean correta;
    private String justificativa;
}
