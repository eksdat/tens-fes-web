package br.unibh.fisiotech.material.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import br.unibh.fisiotech.material.enums.TipoAnexo;

/** Dados do arquivo; o arquivo em si fica no bucket privado do Supabase Storage, em {@code caminho}. */
@Entity
@Table(name = "anexo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Anexo {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(updatable = false)
    private Long conteudoId;

    private String nome;

    @Enumerated(EnumType.STRING)
    private TipoAnexo tipo;

    private Integer tamanhoBytes;

    /** Gerado pelo servidor: o nome que a pessoa deu ao arquivo nunca vira caminho no bucket. */
    @Column(updatable = false)
    private String caminho;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant criadoEm;

    public Anexo(Long conteudoId, String nome, TipoAnexo tipo, int tamanhoBytes, String caminho) {
        this.conteudoId = conteudoId;
        this.nome = nome;
        this.tipo = tipo;
        this.tamanhoBytes = tamanhoBytes;
        this.caminho = caminho;
    }
}
