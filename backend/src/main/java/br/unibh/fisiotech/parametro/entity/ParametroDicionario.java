package br.unibh.fisiotech.parametro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import br.unibh.fisiotech.parametro.enums.GrupoParametro;

@Entity
@Table(name = "parametro_dicionario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ParametroDicionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Enumerated(EnumType.STRING)
    private GrupoParametro grupo;

    private String unidade;

    private String unidadeExtenso;

    @Column(columnDefinition = "text")
    private String oQueMuda;

    @Column(columnDefinition = "text")
    private String exemplo;

    public ParametroDicionario(String nome, GrupoParametro grupo, String unidade, String unidadeExtenso,
            String oQueMuda, String exemplo) {
        this.nome = nome;
        this.grupo = grupo;
        this.unidade = unidade;
        this.unidadeExtenso = unidadeExtenso;
        this.oQueMuda = oQueMuda;
        this.exemplo = exemplo;
    }
}
