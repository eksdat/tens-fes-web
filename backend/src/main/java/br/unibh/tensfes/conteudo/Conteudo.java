package br.unibh.tensfes.conteudo;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "conteudo")
public class Conteudo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Modalidade modalidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Secao secao;

    @Column(nullable = false)
    private Integer ordem;

    @Column(nullable = false, columnDefinition = "text")
    private String corpo;

    @Column(columnDefinition = "text")
    private String referencias;

    @Column(nullable = false)
    private Integer versao = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEditorial estado;

    @Column(name = "data_revisao")
    private LocalDate dataRevisao;

    @Column(name = "criado_em", nullable = false, updatable = false, columnDefinition = "timestamptz")
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false, columnDefinition = "timestamptz")
    private Instant atualizadoEm;

    protected Conteudo() {
    }

    public Conteudo(String titulo, Modalidade modalidade, Secao secao, Integer ordem, String corpo,
            String referencias, EstadoEditorial estado, LocalDate dataRevisao) {
        this.titulo = titulo;
        this.modalidade = modalidade;
        this.secao = secao;
        this.ordem = ordem;
        this.corpo = corpo;
        this.referencias = referencias;
        this.estado = estado;
        this.dataRevisao = dataRevisao;
    }

    @PrePersist
    void prePersist() {
        criadoEm = Instant.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void preUpdate() {
        atualizadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public Modalidade getModalidade() {
        return modalidade;
    }

    public Secao getSecao() {
        return secao;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public String getCorpo() {
        return corpo;
    }

    public String getReferencias() {
        return referencias;
    }

    public Integer getVersao() {
        return versao;
    }

    public EstadoEditorial getEstado() {
        return estado;
    }

    public LocalDate getDataRevisao() {
        return dataRevisao;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
