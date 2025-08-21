package com.backpack.bpweb.chore.resumos.entity;

import com.backpack.bpweb.chore.materias.entity.Materia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "Resumo")
@Table(name = "resumos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String titulo;
    @Column(name = "conteudo", columnDefinition = "TEXT", nullable = false)
    private String conteudo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "materia_id")
    private Materia materia;
}
