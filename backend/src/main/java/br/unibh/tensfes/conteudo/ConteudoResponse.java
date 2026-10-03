package br.unibh.tensfes.conteudo;

import java.time.LocalDate;
import java.util.UUID;

public record ConteudoResponse(
        UUID id,
        String titulo,
        Modalidade modalidade,
        Secao secao,
        String corpo,
        String referencias,
        Integer versao,
        LocalDate dataRevisao) {

    public static ConteudoResponse de(Conteudo conteudo) {
        return new ConteudoResponse(
                conteudo.getId(),
                conteudo.getTitulo(),
                conteudo.getModalidade(),
                conteudo.getSecao(),
                conteudo.getCorpo(),
                conteudo.getReferencias(),
                conteudo.getVersao(),
                conteudo.getDataRevisao());
    }
}
