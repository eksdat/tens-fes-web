package br.unibh.fisiotech.parametro.dto;

import br.unibh.fisiotech.parametro.entity.ParametroDicionario;
import br.unibh.fisiotech.parametro.enums.GrupoParametro;

public record ParametroDicionarioResponse(
        Long id,
        String nome,
        GrupoParametro grupo,
        String unidade,
        String unidadeExtenso,
        String oQueMuda,
        String exemplo) {

    public static ParametroDicionarioResponse de(ParametroDicionario p) {
        return new ParametroDicionarioResponse(p.getId(), p.getNome(), p.getGrupo(), p.getUnidade(),
                p.getUnidadeExtenso(), p.getOQueMuda(), p.getExemplo());
    }
}
