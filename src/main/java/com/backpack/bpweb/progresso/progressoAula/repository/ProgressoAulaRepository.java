package com.backpack.bpweb.progresso.progressoAula.repository;

import com.backpack.bpweb.chore.aulas.entity.Aula;
import com.backpack.bpweb.progresso.progressoAula.entity.ProgressoAula;
import com.backpack.bpweb.user.entity.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressoAulaRepository extends JpaRepository<ProgressoAula, Integer> {
    // Busca todos os registros de progresso para um usuário específico.
    List<ProgressoAula> findByUsuario(Usuarios usuario);

    // Busca um registro de progresso específico para uma combinação de usuário e aula.
    Optional<ProgressoAula> findByUsuarioAndAula(Usuarios usuario, Aula aula);

    long countByUsuarioAndStatus_nome(Usuarios usuario, String statusNome);

    List<ProgressoAula> findByUsuarioAndStatus_nome(Usuarios usuario, String statusNome);
}
