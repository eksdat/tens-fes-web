package br.unibh.fisiotech.conteudo.controller;

import java.util.List;
import java.util.UUID;

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

import br.unibh.fisiotech.conteudo.dto.DevolucaoRequest;
import br.unibh.fisiotech.conteudo.dto.RevisaoConteudoResponse;
import br.unibh.fisiotech.conteudo.service.RevisaoConteudoService;

/** Fila do revisor (docente). O revisor é sempre o {@code sub} do token, nunca um campo do corpo. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/revisao/conteudos")
@PreAuthorize("hasRole('REVISOR')")
public class RevisaoConteudoController {

    private final RevisaoConteudoService service;

    @GetMapping
    public List<RevisaoConteudoResponse> listar() {
        return service.listarEmRevisao();
    }

    @PostMapping("/{id}/aprovar")
    public RevisaoConteudoResponse aprovar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
        return service.aprovar(id, revisor(jwt));
    }

    @PostMapping("/{id}/devolver")
    public RevisaoConteudoResponse devolver(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id,
            @Valid @RequestBody DevolucaoRequest req) {
        return service.devolver(id, revisor(jwt), req.motivo());
    }

    private static UUID revisor(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
