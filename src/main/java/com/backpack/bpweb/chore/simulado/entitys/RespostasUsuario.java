package com.backpack.bpweb.chore.simulado.entitys;

import com.backpack.bpweb.chore.simulado.bancoQuestoes.alternativas.entity.Alternativas;
import com.backpack.bpweb.chore.simulado.bancoQuestoes.topicoQuestao.entity.TopicosQuestoes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "RespostasUsuario")
@Table(name = "respostas_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RespostasUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tentativa_id")
    private TentativasSimulados tentativa;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topico_id")
    private TopicosQuestoes topico;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "alternativa_escolhida_id")
    private Alternativas alternativaEscolhida;
    @Column(name = "esta_correta", nullable = false)
    private boolean isCorreta;
}
