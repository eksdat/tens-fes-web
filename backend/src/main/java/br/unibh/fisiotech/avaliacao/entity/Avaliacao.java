package br.unibh.fisiotech.avaliacao.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
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
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.MapKeyEnumerated;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.ItemTriagem;

@Entity
@Table(name = "avaliacao")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Avaliacao {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(updatable = false)
    private UUID pacienteId;

    private LocalDate dataAvaliacao;
    private String queixa;
    private String historico;
    private Short dorEscala;
    private String dorContexto;
    private String dorTarefa;
    private String dorMomento;
    private String objetivo;
    private String plano;

    @ElementCollection
    @CollectionTable(name = "avaliacao_triagem", joinColumns = @JoinColumn(name = "avaliacao_id"))
    @MapKeyColumn(name = "item")
    @MapKeyEnumerated(EnumType.STRING)
    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private Map<ItemTriagem, EstadoAchado> triagem = new EnumMap<>(ItemTriagem.class);

    @ElementCollection
    @CollectionTable(name = "avaliacao_achado", joinColumns = @JoinColumn(name = "avaliacao_id"))
    @OrderColumn(name = "ordem")
    private List<Achado> achados = new ArrayList<>();

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

    public Avaliacao(UUID pacienteId) {
        this.pacienteId = pacienteId;
    }

    public void atualizar(LocalDate dataAvaliacao, String queixa, String historico, Short dorEscala,
            String dorContexto, String dorTarefa, String dorMomento, String objetivo, String plano,
            Map<ItemTriagem, EstadoAchado> triagem, List<Achado> achados) {
        this.dataAvaliacao = dataAvaliacao;
        this.queixa = queixa;
        this.historico = historico;
        this.dorEscala = dorEscala;
        this.dorContexto = dorContexto;
        this.dorTarefa = dorTarefa;
        this.dorMomento = dorMomento;
        this.objetivo = objetivo;
        this.plano = plano;
        this.triagem.clear();
        this.triagem.putAll(triagem);
        this.achados.clear();
        this.achados.addAll(achados);
    }
}
