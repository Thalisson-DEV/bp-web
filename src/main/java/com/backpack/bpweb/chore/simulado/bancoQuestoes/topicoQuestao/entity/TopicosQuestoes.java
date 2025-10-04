package com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity;

import com.backpack.bpweb.chore.materias.entity.Materia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "TopicosQuestoes")
@Table(name = "topicos_questoes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TopicosQuestoes {


    // Entity que serve como um conjunto de questoes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String titulo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "materia_id")
    private Materia materia;
    private String nivel;
}
