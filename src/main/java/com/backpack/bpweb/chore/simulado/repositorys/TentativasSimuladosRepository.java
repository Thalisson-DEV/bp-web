package com.backpack.bpweb.chore.simulado.repositorys;

import com.backpack.bpweb.chore.simulado.entitys.TentativasSimulados;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TentativasSimuladosRepository extends JpaRepository<TentativasSimulados, Integer> {

    TentativasSimulados findByUsuarioId(Integer usuarioId);

    Optional<TentativasSimulados> findByIdAndUsuarioId(Integer id, Integer usuarioId);
}
