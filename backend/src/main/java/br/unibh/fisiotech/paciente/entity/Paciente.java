package br.unibh.fisiotech.paciente.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Excluído some de toda consulta JPA ({@code @SQLRestriction}); o pg_cron apaga de vez depois de 90 dias. */
@Entity
@Table(name = "paciente")
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("excluido_em is null")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Paciente {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(updatable = false)
    private UUID responsavelId;

    private String nome;

    private String sobrenome;

    private String identificador;

    private String email;

    private LocalDate dataNascimento;

    @CreatedDate
    @Column(updatable = false)
    private Instant criadoEm;

    @CreatedBy
    @Column(updatable = false)
    private UUID criadoPor;

    @LastModifiedDate
    private Instant alteradoEm;

    @LastModifiedBy
    private UUID alteradoPor;

    private Instant excluidoEm;

    public Paciente(UUID responsavelId) {
        this.responsavelId = responsavelId;
    }

    public void atualizar(String nome, String sobrenome, String identificador, String email,
            LocalDate dataNascimento) {
        this.nome = nome.trim();
        this.sobrenome = sobrenome.trim();
        this.identificador = identificador.trim();
        this.email = email == null || email.isBlank() ? null : email.trim();
        this.dataNascimento = dataNascimento;
    }

    public void excluir(Instant quando) {
        this.excluidoEm = quando;
    }
}
