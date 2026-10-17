package br.unibh.fisiotech.sessao.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.sessao.dto.SessaoRequest;
import br.unibh.fisiotech.sessao.dto.SessaoResponse;
import br.unibh.fisiotech.sessao.service.SessaoService;

/** Posse checada pelo paciente: sessão de paciente alheio responde 404, ao registrar ou ao ver. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pacientes/{pacienteId}/sessoes")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class SessaoController {

    private final SessaoService service;

    @GetMapping
    public List<SessaoResponse> listar(@AuthenticationPrincipal Jwt jwt, @PathVariable("pacienteId") UUID pacienteId) {
        return service.listar(pacienteId, UUID.fromString(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public SessaoResponse buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable("pacienteId") UUID pacienteId,
            @PathVariable("id") UUID id) {
        return service.buscar(pacienteId, id, UUID.fromString(jwt.getSubject()));
    }

    @PostMapping
    public ResponseEntity<SessaoResponse> registrar(@AuthenticationPrincipal Jwt jwt,
            @PathVariable("pacienteId") UUID pacienteId, @Valid @RequestBody SessaoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrar(pacienteId, UUID.fromString(jwt.getSubject()), req));
    }
}
