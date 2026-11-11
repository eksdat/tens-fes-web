package br.unibh.fisiotech.conteudo.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.dto.RevisaoConteudoResponse;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;
import br.unibh.fisiotech.shared.exception.AcaoProibidaException;
import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

/** Revisão editorial (guia técnico, seção 23): só conteúdo aprovado aparece para o estudante. */
@Service
@RequiredArgsConstructor
public class RevisaoConteudoService {

    /** Mesma ordem do site: módulo, aba e bloco da página técnica. */
    private static final Comparator<Conteudo> ORDEM_DO_SITE = Comparator.comparing(Conteudo::getModalidade)
            .thenComparing(Conteudo::getSecao)
            .thenComparing(Conteudo::getBloco, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(Conteudo::getId);

    private final ConteudoRepository repository;

    private final Clock relogio;

    @Transactional(readOnly = true)
    public List<RevisaoConteudoResponse> listarEmRevisao() {
        return repository.findByEstado(EstadoEditorial.EM_REVISAO).stream()
                .sorted(ORDEM_DO_SITE)
                .map(RevisaoConteudoResponse::de)
                .toList();
    }

    @Transactional
    public RevisaoConteudoResponse aprovar(Long id, UUID revisor) {
        var conteudo = emRevisao(id, revisor);
        conteudo.aprovar(revisor, LocalDate.now(relogio));
        return RevisaoConteudoResponse.de(conteudo);
    }

    @Transactional
    public RevisaoConteudoResponse devolver(Long id, UUID revisor, String motivo) {
        var conteudo = emRevisao(id, revisor);
        conteudo.devolver(revisor, motivo);
        return RevisaoConteudoResponse.de(conteudo);
    }

    /** Só o que está em revisão pode ser aprovado ou devolvido, e nunca por quem escreveu. */
    private Conteudo emRevisao(Long id, UUID revisor) {
        var conteudo = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conteúdo não encontrado."));
        if (conteudo.getEstado() != EstadoEditorial.EM_REVISAO) {
            throw new ConflitoException("Este conteúdo não está mais em revisão.");
        }
        if (revisor.equals(conteudo.getAutorId())) {
            throw new AcaoProibidaException("Quem escreveu o conteúdo não pode revisá-lo.");
        }
        return conteudo;
    }
}
