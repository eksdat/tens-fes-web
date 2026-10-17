package br.unibh.fisiotech.parametro.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.dto.FaixaParametroResponse;
import br.unibh.fisiotech.parametro.repository.FaixaParametroRepository;

@Service
@RequiredArgsConstructor
public class FaixaParametroService {

    private final FaixaParametroRepository repository;

    @Transactional(readOnly = true)
    public List<FaixaParametroResponse> listar(Modalidade modalidade) {
        return repository.findByModalidadeOrderByIdAsc(modalidade).stream().map(FaixaParametroResponse::de).toList();
    }
}
