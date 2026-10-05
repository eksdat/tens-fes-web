package br.unibh.fisiotech.conteudo.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.dto.ConteudoResponse;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

@Service
@RequiredArgsConstructor
public class ConteudoService {

    private final ConteudoRepository repository;

    @Transactional(readOnly = true)
    public List<ConteudoResponse> listarAprovados(List<Modalidade> modalidades) {
        return repository.findByModalidadeInAndEstadoOrderByIdAsc(modalidades, EstadoEditorial.APROVADO)
                .stream()
                .sorted(Comparator.comparing(Conteudo::getSecao))
                .map(ConteudoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConteudoResponse buscarAprovado(Long id) {
        return repository.findByIdAndEstado(id, EstadoEditorial.APROVADO)
                .map(ConteudoResponse::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conteúdo não encontrado."));
    }
}
