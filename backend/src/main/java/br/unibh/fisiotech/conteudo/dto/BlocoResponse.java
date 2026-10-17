package br.unibh.fisiotech.conteudo.dto;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Bloco;

public record BlocoResponse(Bloco bloco, String titulo, String corpo, String referencias) {

    public static BlocoResponse de(Conteudo c) {
        return new BlocoResponse(c.getBloco(), c.getTitulo(), c.getCorpo(), c.getReferencias());
    }
}
