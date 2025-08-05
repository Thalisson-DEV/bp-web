package com.backpack.bpweb.controllers;

import com.backpack.bpweb.dtos.LoginRequestDTO;
import com.backpack.bpweb.dtos.LoginResponseDTO;
import com.backpack.bpweb.dtos.UsuarioCreateDTO;
import com.backpack.bpweb.infra.security.TokenService;
import com.backpack.bpweb.models.Usuarios;
import com.backpack.bpweb.repositories.UsuariosRepository;
import com.backpack.bpweb.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UsuariosRepository repository;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid LoginRequestDTO data) {
        var usuarioPassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usuarioPassword);
        var user = usuarioService.getUsuarioByEmail(data.email());
        var token = tokenService.generateToken((Usuarios) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UsuarioCreateDTO data) {
        if (this.repository.findByEmail(data.email()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email já está em uso."));
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senha());

        Usuarios newUser = new Usuarios();

        newUser.setNomeCompleto(data.nomeCompleto());
        newUser.setEmail(data.email());
        newUser.setIdade(data.idade());
        newUser.setSenha(encryptedPassword);
        newUser.setDataCriacao(OffsetDateTime.now());
        newUser.setDataAtualizacao(OffsetDateTime.now());

        repository.save(newUser);

        return ResponseEntity.ok().build();
    }

}
