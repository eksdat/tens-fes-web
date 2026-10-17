package br.unibh.fisiotech.conteudo.service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.dto.BlocoResponse;
import br.unibh.fisiotech.conteudo.dto.ConteudoResponse;
import br.unibh.fisiotech.conteudo.dto.PaginaTecnicaResponse;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Bloco;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
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

    /** Liberada só com os cinco blocos aprovados; antes disso a página sai fechada, sem texto em revisão. */
    @Transactional(readOnly = true)
    public PaginaTecnicaResponse paginaTecnica(Modalidade modalidade, Secao secao) {
        var blocos = repository.findByModalidadeAndSecaoAndBlocoIsNotNull(modalidade, secao).stream()
                .sorted(Comparator.comparing(Conteudo::getBloco))
                .toList();
        var completa = blocos.size() == Bloco.values().length
                && blocos.stream().allMatch(c -> c.getEstado() == EstadoEditorial.APROVADO);
        if (!completa) {
            return PaginaTecnicaResponse.fechada(modalidade, secao);
        }
        var referencias = blocos.stream()
                .flatMap(c -> Arrays.stream(c.getReferencias() == null ? new String[0] : c.getReferencias().split(";")))
                .map(String::trim)
                .filter(r -> !r.isEmpty())
                .distinct()
                .toList();
        var dataRevisao = blocos.stream().map(Conteudo::getDataRevisao).max(Comparator.naturalOrder()).orElse(null);
        return new PaginaTecnicaResponse(modalidade, secao, true, blocos.stream().map(BlocoResponse::de).toList(),
                referencias, dataRevisao);
    }
}
