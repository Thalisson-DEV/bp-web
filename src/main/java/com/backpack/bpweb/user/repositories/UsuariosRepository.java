package com.backpack.bpweb.user.repositories;

import com.backpack.bpweb.user.DTOs.UsuarioResponseDTO;
import com.backpack.bpweb.user.entity.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuariosRepository extends JpaRepository<Usuarios, Integer> {
    Usuarios findByEmail(String email);

    @Query("SELECT new com.backpack.bpweb.user.DTOs.UsuarioResponseDTO(u.nomeCompleto, u.email, u.idade) FROM usuarios u WHERE u.email = :email")
    Optional<UsuarioResponseDTO> findByEmailToDTO(@Param("email") String email);

    @Query("SELECT new com.backpack.bpweb.user.DTOs.UsuarioResponseDTO(u.nomeCompleto, u.email, u.idade) FROM usuarios u WHERE u.id = :id")
    Optional<UsuarioResponseDTO> findByIdToDTO(@Param("id") Integer id);
}
