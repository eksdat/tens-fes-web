package br.unibh.tensfes.conteudo;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conteudos")
public class ConteudoController {

    private final ConteudoService service;

    public ConteudoController(ConteudoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ConteudoResponse>> listar(@RequestParam("modalidade") List<Modalidade> modalidades) {
        return ResponseEntity.ok(service.listarAprovados(modalidades));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConteudoResponse> buscar(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.buscarAprovado(id));
    }
}
