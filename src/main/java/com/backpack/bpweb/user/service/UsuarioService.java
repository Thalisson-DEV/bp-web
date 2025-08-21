package com.backpack.bpweb.user.service;

import com.backpack.bpweb.user.DTOs.UsuarioResponseDTO;
import com.backpack.bpweb.user.repositories.UsuariosRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    UsuariosRepository repository;

    public UsuarioResponseDTO getUsuarioByEmail(String email) {
        return repository.findByEmailToDTO(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
    }

    public UsuarioResponseDTO getUsuarioById(Integer id) {
        return repository.findByIdToDTO(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario não encontrado com o id: " + id));
    }
}
