package com.backpack.bpweb.progresso.progressoAula.statusProgressoAula.repository;

import com.backpack.bpweb.progresso.progressoAula.statusProgressoAula.entity.StatusProgressoAula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusProgressoAulaRepository extends JpaRepository<StatusProgressoAula, Integer> {

    Optional<StatusProgressoAula> findByNome(String nome);
}
