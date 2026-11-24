package br.unibh.fisiotech.conteudo.dto;

import java.time.LocalDate;
import java.util.List;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Bloco;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.material.dto.AnexoResponse;

/** Conteúdo como o revisor vê: texto completo, fonte, anexos (material de estudo) e a situação da revisão. */
public record RevisaoConteudoResponse(
        Long id,
        String titulo,
        Modalidade modalidade,
        Secao secao,
        Bloco bloco,
        String corpo,
        String referencias,
        Integer versao,
        EstadoEditorial estado,
        LocalDate dataRevisao,
        String motivoDevolucao,
        /** Escrito por um usuário na tela "Criar conteúdo" (tem autor); os textos do guia não têm. */
        boolean material,
        List<AnexoResponse> anexos) {

    public static RevisaoConteudoResponse de(Conteudo c, List<AnexoResponse> anexos) {
        return new RevisaoConteudoResponse(c.getId(), c.getTitulo(), c.getModalidade(), c.getSecao(), c.getBloco(),
                c.getCorpo(), c.getReferencias(), c.getVersao(), c.getEstado(), c.getDataRevisao(),
                c.getMotivoDevolucao(), c.getAutorId() != null, anexos);
    }
}
