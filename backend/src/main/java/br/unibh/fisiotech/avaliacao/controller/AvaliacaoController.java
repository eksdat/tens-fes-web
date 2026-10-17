package br.unibh.fisiotech.avaliacao.controller;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.avaliacao.dto.AvaliacaoRequest;
import br.unibh.fisiotech.avaliacao.dto.AvaliacaoResponse;
import br.unibh.fisiotech.avaliacao.service.AvaliacaoService;

/** Posse checada pelo paciente: avaliação de paciente alheio responde 404. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pacientes/{pacienteId}/avaliacoes")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class AvaliacaoController {

    private final AvaliacaoService service;

    @GetMapping
    public List<AvaliacaoResponse> listar(@AuthenticationPrincipal Jwt jwt, @PathVariable("pacienteId") UUID pacienteId,
            @RequestParam(name = "direcao", defaultValue = "desc") @Pattern(regexp = "asc|desc") String direcao) {
        return service.listar(pacienteId, responsavel(jwt), "asc".equals(direcao));
    }

    @GetMapping("/{id}")
    public AvaliacaoResponse buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable("pacienteId") UUID pacienteId,
            @PathVariable("id") UUID id) {
        return service.buscar(pacienteId, id, responsavel(jwt));
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> criar(@AuthenticationPrincipal Jwt jwt,
            @PathVariable("pacienteId") UUID pacienteId, @Valid @RequestBody AvaliacaoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(pacienteId, responsavel(jwt), req));
    }

    @PutMapping("/{id}")
    public AvaliacaoResponse atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable("pacienteId") UUID pacienteId,
            @PathVariable("id") UUID id, @Valid @RequestBody AvaliacaoRequest req) {
        return service.atualizar(pacienteId, id, responsavel(jwt), req);
    }

    private static UUID responsavel(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
