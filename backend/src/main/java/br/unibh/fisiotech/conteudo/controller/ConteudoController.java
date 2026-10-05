package br.unibh.fisiotech.conteudo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.dto.ConteudoResponse;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.service.ConteudoService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/conteudos")
public class ConteudoController {

    private final ConteudoService service;

    @GetMapping
    public List<ConteudoResponse> listar(@RequestParam("modalidade") List<Modalidade> modalidades) {
        return service.listarAprovados(modalidades);
    }

    @GetMapping("/{id}")
    public ConteudoResponse buscar(@PathVariable("id") Long id) {
        return service.buscarAprovado(id);
    }
}
