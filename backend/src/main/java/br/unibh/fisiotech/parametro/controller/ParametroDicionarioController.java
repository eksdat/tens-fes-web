package br.unibh.fisiotech.parametro.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.dto.FaixaParametroResponse;
import br.unibh.fisiotech.parametro.dto.ParametroDicionarioResponse;
import br.unibh.fisiotech.parametro.service.FaixaParametroService;
import br.unibh.fisiotech.parametro.service.ParametroDicionarioService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/parametros")
public class ParametroDicionarioController {

    private final ParametroDicionarioService service;

    private final FaixaParametroService faixas;

    @GetMapping
    public List<ParametroDicionarioResponse> listar(
            @RequestParam(name = "busca", required = false) @Size(max = 100) String busca) {
        return service.listar(busca);
    }

    @GetMapping("/faixas")
    public List<FaixaParametroResponse> listarFaixas(@RequestParam("modalidade") Modalidade modalidade) {
        return faixas.listar(modalidade);
    }
}
