package br.unibh.fisiotech.paciente.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.paciente.dto.PacienteRequest;
import br.unibh.fisiotech.paciente.dto.PacienteResponse;
import br.unibh.fisiotech.paciente.service.PacienteService;
import br.unibh.fisiotech.shared.dto.PaginaResponse;

/** O responsável é sempre o {@code sub} do token. A posse é checada no service, nunca aqui. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pacientes")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class PacienteController {

    private final PacienteService service;

    @GetMapping
    public PaginaResponse<PacienteResponse> listar(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "busca", required = false) @Size(max = 100) String busca,
            @RequestParam(name = "ordenar", defaultValue = "nome") String ordenar,
            @RequestParam(name = "direcao", defaultValue = "asc") String direcao,
            @RequestParam(name = "pagina", defaultValue = "0") @Min(0) int pagina,
            @RequestParam(name = "tamanho", defaultValue = "20") @Min(1) @Max(50) int tamanho) {
        return service.listar(responsavel(jwt), busca, ordenar, direcao, pagina, tamanho);
    }

    @GetMapping("/{id}")
    public PacienteResponse buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") UUID id) {
        return service.buscar(id, responsavel(jwt));
    }

    @PostMapping
    public ResponseEntity<PacienteResponse> criar(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PacienteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(responsavel(jwt), req));
    }

    @PutMapping("/{id}")
    public PacienteResponse atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") UUID id,
            @Valid @RequestBody PacienteRequest req) {
        return service.atualizar(id, responsavel(jwt), req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") UUID id) {
        service.excluir(id, responsavel(jwt));
        return ResponseEntity.noContent().build();
    }

    private static UUID responsavel(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
