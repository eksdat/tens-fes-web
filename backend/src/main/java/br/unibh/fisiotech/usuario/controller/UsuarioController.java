package br.unibh.fisiotech.usuario.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;
import br.unibh.fisiotech.usuario.dto.AtualizarPerfilProfissionalRequest;
import br.unibh.fisiotech.usuario.dto.CadastroRequest;
import br.unibh.fisiotech.usuario.dto.UsuarioResponse;
import br.unibh.fisiotech.usuario.service.UsuarioService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/usuarios/me")
public class UsuarioController {

    private final UsuarioService service;

    @GetMapping
    public UsuarioResponse buscar(@AuthenticationPrincipal Jwt jwt) {
        return service.buscar(UUID.fromString(jwt.getSubject()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cadastro não concluído."));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrar(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CadastroRequest req) {
        var criado = service.cadastrar(UUID.fromString(jwt.getSubject()), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping({ "", "/perfil" })
    public UsuarioResponse atualizarPerfilProfissional(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AtualizarPerfilProfissionalRequest req) {
        return service.atualizarPerfilProfissional(UUID.fromString(jwt.getSubject()), req);
    }
}
