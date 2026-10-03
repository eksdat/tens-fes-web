package br.unibh.fisiotech.usuario.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import org.springframework.data.domain.Persistable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.enums.Uf;

/**
 * Dados do usuário que não estão no Supabase Auth. O id vem do token, por isso {@link Persistable}: sem ele o
 * {@code save} faria {@code merge} e um segundo cadastro com o mesmo id sobrescreveria o primeiro em vez de falhar.
 */
@Entity
@Table(name = "usuario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Usuario implements Persistable<UUID> {

    @Id
    private UUID id;

    private String nome;

    @Enumerated(EnumType.STRING)
    private Perfil perfil;

    private boolean revisor;

    private boolean ativo = true;

    private String instituicao;

    private Short periodo;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    private String registro;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 2)
    private Uf uf;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant criadoEm;

    @UpdateTimestamp
    private Instant atualizadoEm;

    @Transient
    @Getter(AccessLevel.NONE)
    private boolean novo;

    public Usuario(UUID id, String nome, Perfil perfil) {
        this.id = id;
        this.nome = nome;
        this.perfil = perfil;
        this.novo = true;
    }

    public void definirDadosEstudante(String instituicao, Short periodo) {
        this.instituicao = instituicao;
        this.periodo = periodo;
    }

    public void definirDadosProfissional(Categoria categoria, String registro, Uf uf) {
        this.categoria = categoria;
        this.registro = registro;
        this.uf = uf;
    }

    @Override
    public boolean isNew() {
        return novo;
    }

    @PostLoad
    @PostPersist
    void marcarPersistido() {
        this.novo = false;
    }
}
