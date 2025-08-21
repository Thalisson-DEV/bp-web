package com.backpack.bpweb.user.auth.controllers;

import com.backpack.bpweb.user.DTOs.EmailDTO;
import com.backpack.bpweb.user.auth.dtos.LoginRequestDTO;
import com.backpack.bpweb.user.DTOs.UsuarioCreateDTO;
import com.backpack.bpweb.infra.security.TokenService;
import com.backpack.bpweb.user.entity.Usuarios;
import com.backpack.bpweb.user.repositories.UsuariosRepository;
import com.backpack.bpweb.user.service.EmailSenderService;
import com.backpack.bpweb.user.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;

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
    @Autowired
    private EmailSenderService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO data) {
        var usuarioPassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usuarioPassword);
        var token = tokenService.generateToken((Usuarios) auth.getPrincipal());

        Cookie cookie = new Cookie("Authorization", "Bearer " + token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(2 * 60 * 60);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, String.format("%s=%s; HttpOnly; Path=/; Max-Age=%d", cookie.getName(), token, cookie.getMaxAge()))
                .body("Autenticado com sucesso.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Não autorizado");
        }

        var usuario = (Usuarios) auth.getPrincipal();
        var usuarioDTO = repository.findByEmailToDTO(usuario.getEmail());
        return ResponseEntity.ok(usuarioDTO);
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid EmailDTO requestEmail) {
        String email = requestEmail.email();
        String newPassword = usuarioService.generatePassword(10);
        String encryptedPassword = new BCryptPasswordEncoder().encode(newPassword);

        Usuarios usuario = repository.findByEmail(email);

        if (usuario == null) {
            return ResponseEntity.badRequest().body("Usuário não encontrado para o email informado.");
        }

        usuario.setSenha(encryptedPassword);
        repository.save(usuario);

        emailService.sendNewPasswordEmail(usuario, newPassword);
        return ResponseEntity.ok().body("Nova senha gerada com sucesso.");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {

        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }

        SecurityContextHolder.clearContext();

        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok("Logout realizado com sucesso.");
    }


}
