package br.unibh.fisiotech.conteudo.dto;

import java.time.LocalDate;
import java.util.List;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

/** Página não liberada vem sem blocos: texto em revisão nunca sai da API. */
public record PaginaTecnicaResponse(
        Modalidade modalidade,
        Secao secao,
        boolean liberada,
        List<BlocoResponse> blocos,
        List<String> referencias,
        LocalDate dataRevisao) {

    public static PaginaTecnicaResponse fechada(Modalidade modalidade, Secao secao) {
        return new PaginaTecnicaResponse(modalidade, secao, false, List.of(), List.of(), null);
    }
}
