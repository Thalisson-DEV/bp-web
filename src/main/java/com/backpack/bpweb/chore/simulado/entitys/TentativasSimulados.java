package com.backpack.bpweb.chore.simulado.entitys;

import com.backpack.bpweb.user.entity.Usuarios;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity(name = "tentativasSimulados")
@Table(name = "tentativas_simulado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TentativasSimulados {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuarios usuario;
    private OffsetDateTime dataInicio;
    private OffsetDateTime dataFim;
    private BigDecimal pontuacaoFinal;
}
