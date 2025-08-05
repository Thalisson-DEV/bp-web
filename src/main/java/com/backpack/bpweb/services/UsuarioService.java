package com.backpack.bpweb.services;

import com.backpack.bpweb.models.Usuarios;
import com.backpack.bpweb.repositories.UsuariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    UsuariosRepository repository;

    public String getUsuario(String email) {
        return repository.findByEmail(email).getNomeCompleto();
    }

    public Usuarios getUsuarioByEmail(String email) {
        return repository.findByEmail(email);
    }

}
