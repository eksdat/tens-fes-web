package br.unibh.fisiotech.sessao.entity;

import java.math.BigDecimal;

import jakarta.persistence.Embeddable;

/** Parâmetros efetivos de um canal. A unidade está no nome do campo. */
@Embeddable
public record Canal(
        Short canal,
        BigDecimal frequenciaHz,
        Integer larguraPulsoUs,
        BigDecimal amplitudeInicialMa,
        BigDecimal amplitudeFinalMa,
        String par) {
}
