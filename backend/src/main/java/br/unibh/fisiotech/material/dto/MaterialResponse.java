package br.unibh.fisiotech.material.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

/** Material como o autor vê. {@code motivoDevolucao} preenchido em RASCUNHO = o revisor devolveu. */
public record MaterialResponse(
        Long id,
        String titulo,
        Modalidade modalidade,
        Secao secao,
        String corpo,
        String referencias,
        EstadoEditorial estado,
        String motivoDevolucao,
        LocalDate dataRevisao,
        List<AnexoResponse> anexos,
        Instant criadoEm,
        Instant atualizadoEm) {

    public static MaterialResponse de(Conteudo c, List<AnexoResponse> anexos) {
        return new MaterialResponse(c.getId(), c.getTitulo(), c.getModalidade(), c.getSecao(), c.getCorpo(),
                c.getReferencias(), c.getEstado(), c.getMotivoDevolucao(), c.getDataRevisao(), anexos,
                c.getCriadoEm(), c.getAtualizadoEm());
    }
}
