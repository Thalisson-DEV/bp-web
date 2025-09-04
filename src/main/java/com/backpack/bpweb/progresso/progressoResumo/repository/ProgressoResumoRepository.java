package com.backpack.bpweb.progresso.progressoResumo.repository;

import com.backpack.bpweb.chore.resumos.entity.Resumo;
import com.backpack.bpweb.progresso.progressoResumo.entity.ProgressoResumo;
import com.backpack.bpweb.user.entity.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressoResumoRepository extends JpaRepository<ProgressoResumo, Integer> {

    List<ProgressoResumo> findByUsuario(Usuarios usuario);

    Optional<ProgressoResumo> findByUsuarioAndResumo(Usuarios usuario, Resumo resumo);

    long countByUsuario(Usuarios usuario);
}
