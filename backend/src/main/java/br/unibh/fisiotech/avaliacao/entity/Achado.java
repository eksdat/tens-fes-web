package br.unibh.fisiotech.avaliacao.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import br.unibh.fisiotech.avaliacao.enums.BlocoAchado;
import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.Lado;

/** Achado de pele, sensibilidade ou função motora; sempre com lado, região e método (guia, seção 17). */
@Embeddable
public record Achado(
        @Enumerated(EnumType.STRING) BlocoAchado bloco,
        String descricao,
        @Enumerated(EnumType.STRING) EstadoAchado estado,
        @Enumerated(EnumType.STRING) Lado lado,
        String regiao,
        String metodo) {
}
