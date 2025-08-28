package com.backpack.bpweb.progresso.progressoAula.statusProgressoAula.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "StatusProgressAula")
@Table(name = "status_progresso_aula")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatusProgressoAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nome;
}
