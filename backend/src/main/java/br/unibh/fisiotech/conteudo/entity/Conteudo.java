package br.unibh.fisiotech.conteudo.entity;

import java.time.Instant;
import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

@Entity
@Table(name = "conteudo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Conteudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Enumerated(EnumType.STRING)
    private Modalidade modalidade;

    @Enumerated(EnumType.STRING)
    private Secao secao;

    @Column(columnDefinition = "text")
    private String corpo;

    @Column(columnDefinition = "text")
    private String referencias;

    private Integer versao = 1;

    @Enumerated(EnumType.STRING)
    private EstadoEditorial estado;

    private LocalDate dataRevisao;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant criadoEm;

    @UpdateTimestamp
    private Instant atualizadoEm;

    public Conteudo(String titulo, Modalidade modalidade, Secao secao, String corpo,
            String referencias, EstadoEditorial estado, LocalDate dataRevisao) {
        this.titulo = titulo;
        this.modalidade = modalidade;
        this.secao = secao;
        this.corpo = corpo;
        this.referencias = referencias;
        this.estado = estado;
        this.dataRevisao = dataRevisao;
    }
}
