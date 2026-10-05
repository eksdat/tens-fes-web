package br.unibh.fisiotech.parametro.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.parametro.dto.ParametroDicionarioResponse;
import br.unibh.fisiotech.parametro.service.ParametroDicionarioService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/parametros")
public class ParametroDicionarioController {

    private final ParametroDicionarioService service;

    @GetMapping
    public List<ParametroDicionarioResponse> listar(@RequestParam(name = "busca", required = false) String busca) {
        return service.listar(busca);
    }
}
