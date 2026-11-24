package br.unibh.fisiotech.material.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.material.dto.AnexoResponse;
import br.unibh.fisiotech.material.dto.LinkAnexoResponse;
import br.unibh.fisiotech.material.dto.MaterialRequest;
import br.unibh.fisiotech.material.dto.MaterialResponse;
import br.unibh.fisiotech.material.service.MaterialService;

/**
 * Materiais de quem está logado (estudante ou profissional; o SecurityConfig já exige perfil). O autor é sempre o
 * {@code sub} do token, nunca um campo do corpo.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/materiais")
public class MaterialController {

    private final MaterialService service;

    @GetMapping
    public List<MaterialResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(autor(jwt));
    }

    @GetMapping("/{id}")
    public MaterialResponse buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
        return service.buscar(id, autor(jwt));
    }

    @PostMapping
    public ResponseEntity<MaterialResponse> criar(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody MaterialRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(autor(jwt), req));
    }

    @PutMapping("/{id}")
    public MaterialResponse alterar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id,
            @Valid @RequestBody MaterialRequest req) {
        return service.alterar(id, autor(jwt), req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
        service.excluir(id, autor(jwt));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enviar")
    public MaterialResponse enviar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
        return service.enviarParaRevisao(id, autor(jwt));
    }

    @PostMapping(path = "/{id}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnexoResponse> anexar(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id,
            @RequestPart("arquivo") MultipartFile arquivo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.anexar(id, autor(jwt), arquivo));
    }

    @DeleteMapping("/{id}/anexos/{anexoId}")
    public ResponseEntity<Void> removerAnexo(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id,
            @PathVariable("anexoId") UUID anexoId) {
        service.removerAnexo(id, anexoId, autor(jwt));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/anexos/{anexoId}/link")
    public LinkAnexoResponse link(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id,
            @PathVariable("anexoId") UUID anexoId) {
        return service.linkDoAnexo(id, anexoId, autor(jwt));
    }

    private static UUID autor(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
