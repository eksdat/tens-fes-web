package br.unibh.fisiotech.parametro.dto;

import java.math.BigDecimal;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.entity.FaixaParametro;
import br.unibh.fisiotech.parametro.enums.OrigemFaixa;

public record FaixaParametroResponse(
        Modalidade modalidade,
        String modo,
        String parametro,
        String unidade,
        String unidadeExtenso,
        OrigemFaixa origem,
        BigDecimal minimo,
        BigDecimal maximo,
        String fonte) {

    public static FaixaParametroResponse de(FaixaParametro f) {
        var p = f.getParametro();
        return new FaixaParametroResponse(f.getModalidade(), f.getModo(), p.getNome(), p.getUnidade(),
                p.getUnidadeExtenso(), f.getOrigem(), f.getMinimo(), f.getMaximo(), f.getFonte());
    }
}
