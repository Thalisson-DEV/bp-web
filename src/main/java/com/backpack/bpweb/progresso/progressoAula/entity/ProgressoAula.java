package com.backpack.bpweb.progresso.progressoAula.entity;

import com.backpack.bpweb.chore.aulas.entity.Aula;
import com.backpack.bpweb.progresso.progressoAula.statusProgressoAula.entity.StatusProgressoAula;
import com.backpack.bpweb.user.entity.Usuarios;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity (name = "ProgressoAula")
@Table(name = "progresso_aulas_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProgressoAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuarios usuario;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aula_id")
    private Aula aula;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private StatusProgressoAula status;
    private OffsetDateTime dataVisualizacao;

}
