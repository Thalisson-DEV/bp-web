package com.backpack.bpweb.repositories;

import com.backpack.bpweb.models.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuariosRepository extends JpaRepository<Usuarios, Integer> {
    Usuarios findByEmail(String email);
}
