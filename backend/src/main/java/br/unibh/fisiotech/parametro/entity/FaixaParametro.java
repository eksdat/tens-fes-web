package br.unibh.fisiotech.parametro.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.enums.OrigemFaixa;

@Entity
@Table(name = "faixa_parametro")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FaixaParametro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Modalidade modalidade;

    private String modo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parametro_id")
    private ParametroDicionario parametro;

    @Enumerated(EnumType.STRING)
    private OrigemFaixa origem;

    private BigDecimal minimo;

    private BigDecimal maximo;

    @Column(columnDefinition = "text")
    private String fonte;

    public FaixaParametro(Modalidade modalidade, String modo, ParametroDicionario parametro, OrigemFaixa origem,
            BigDecimal minimo, BigDecimal maximo, String fonte) {
        this.modalidade = modalidade;
        this.modo = modo;
        this.parametro = parametro;
        this.origem = origem;
        this.minimo = minimo;
        this.maximo = maximo;
        this.fonte = fonte;
    }
}
