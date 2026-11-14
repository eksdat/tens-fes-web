package br.unibh.fisiotech.conteudo.dto;

import java.time.LocalDate;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Bloco;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

/** Conteúdo como o revisor vê: texto completo, fonte e a situação da revisão. */
public record RevisaoConteudoResponse(
        Long id,
        String titulo,
        Modalidade modalidade,
        Secao secao,
        Bloco bloco,
        String corpo,
        String referencias,
        Integer versao,
        EstadoEditorial estado,
        LocalDate dataRevisao,
        String motivoDevolucao) {

    public static RevisaoConteudoResponse de(Conteudo c) {
        return new RevisaoConteudoResponse(c.getId(), c.getTitulo(), c.getModalidade(), c.getSecao(), c.getBloco(),
                c.getCorpo(), c.getReferencias(), c.getVersao(), c.getEstado(), c.getDataRevisao(),
                c.getMotivoDevolucao());
    }
}
