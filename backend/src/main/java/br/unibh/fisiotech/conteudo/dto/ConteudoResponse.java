package br.unibh.fisiotech.conteudo.dto;

import java.time.LocalDate;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

public record ConteudoResponse(
        Long id,
        String titulo,
        Modalidade modalidade,
        Secao secao,
        String corpo,
        String referencias,
        Integer versao,
        LocalDate dataRevisao) {

    public static ConteudoResponse de(Conteudo c) {
        return new ConteudoResponse(c.getId(), c.getTitulo(), c.getModalidade(), c.getSecao(), c.getCorpo(),
                c.getReferencias(), c.getVersao(), c.getDataRevisao());
    }
}
