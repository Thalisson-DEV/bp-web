package com.backpack.bpweb.progresso.progressoResumo.entity;

import com.backpack.bpweb.chore.resumos.entity.Resumo;
import com.backpack.bpweb.user.entity.Usuarios;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity(name = "ProgressoResumo")
@Table(name = "progresso_resumos_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProgressoResumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuarios usuario;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resumo_id")
    private Resumo resumo;
    private OffsetDateTime dataLeitura;
}
