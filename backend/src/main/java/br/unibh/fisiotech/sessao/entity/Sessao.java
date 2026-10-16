package br.unibh.fisiotech.sessao.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import br.unibh.fisiotech.avaliacao.enums.Lado;
import br.unibh.fisiotech.conteudo.enums.Modalidade;

/** Registro clínico: sem endpoint de alteração; quem registrou fica em {@code criadoPor}. */
@Entity
@Table(name = "sessao")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Sessao {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(updatable = false)
    private UUID pacienteId;

    private Instant dataHora;
    private String objetivo;

    @Enumerated(EnumType.STRING)
    private Modalidade modalidade;

    private String aparelho;
    private String modo;
    private BigDecimal duracaoRealMin;

    @ElementCollection
    @CollectionTable(name = "sessao_canal", joinColumns = @JoinColumn(name = "sessao_id"))
    @OrderBy("canal")
    private List<Canal> canais = new ArrayList<>();

    private String eletrodoTipo;
    private String eletrodoDimensoes;

    @Enumerated(EnumType.STRING)
    private Lado lado;

    private String marcos;
    private String montagemId;
    private String sensacao;
    private String contracao;
    private String tolerancia;
    private String fadiga;
    private String ajustes;
    private String medidaAntes;
    private String medidaDepois;
    private String medidaContexto;
    private String condicaoPele;
    private String motivoTermino;
    private String planoReavaliacao;

    @ElementCollection
    @CollectionTable(name = "sessao_checklist", joinColumns = @JoinColumn(name = "sessao_id"))
    @Column(name = "item")
    private Set<String> checklist = new LinkedHashSet<>();

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

    public Sessao(UUID pacienteId) {
        this.pacienteId = pacienteId;
    }

    public void definirContexto(Instant dataHora, String objetivo, Modalidade modalidade) {
        this.dataHora = dataHora;
        this.objetivo = objetivo;
        this.modalidade = modalidade;
    }

    public void definirAplicacao(String aparelho, String modo, BigDecimal duracaoRealMin, List<Canal> canais) {
        this.aparelho = aparelho;
        this.modo = modo;
        this.duracaoRealMin = duracaoRealMin;
        this.canais.clear();
        this.canais.addAll(canais);
    }

    public void definirEletrodos(String tipo, String dimensoes, Lado lado, String marcos, String montagemId) {
        this.eletrodoTipo = tipo;
        this.eletrodoDimensoes = dimensoes;
        this.lado = lado;
        this.marcos = marcos;
        this.montagemId = montagemId;
    }

    public void definirResposta(String sensacao, String contracao, String tolerancia, String fadiga, String ajustes) {
        this.sensacao = sensacao;
        this.contracao = contracao;
        this.tolerancia = tolerancia;
        this.fadiga = fadiga;
        this.ajustes = ajustes;
    }

    public void definirResultado(String medidaAntes, String medidaDepois, String medidaContexto) {
        this.medidaAntes = medidaAntes;
        this.medidaDepois = medidaDepois;
        this.medidaContexto = medidaContexto;
    }

    public void definirEncerramento(String condicaoPele, String motivoTermino, String planoReavaliacao,
            Set<String> checklist) {
        this.condicaoPele = condicaoPele;
        this.motivoTermino = motivoTermino;
        this.planoReavaliacao = planoReavaliacao;
        this.checklist.clear();
        this.checklist.addAll(checklist);
    }
}
