package br.unibh.fisiotech.avaliacao.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.unibh.fisiotech.avaliacao.entity.Avaliacao;
import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.ItemTriagem;

public record AvaliacaoResponse(
        UUID id,
        UUID pacienteId,
        LocalDate dataAvaliacao,
        String queixa,
        String historico,
        Short dorEscala,
        String dorContexto,
        String dorTarefa,
        String dorMomento,
        String objetivo,
        String plano,
        Map<ItemTriagem, EstadoAchado> triagem,
        List<AchadoDto> achados,
        Instant criadoEm,
        UUID criadoPor,
        Instant alteradoEm,
        UUID alteradoPor) {

    public static AvaliacaoResponse de(Avaliacao a) {
        return new AvaliacaoResponse(a.getId(), a.getPacienteId(), a.getDataAvaliacao(), a.getQueixa(),
                a.getHistorico(), a.getDorEscala(), a.getDorContexto(), a.getDorTarefa(), a.getDorMomento(),
                a.getObjetivo(), a.getPlano(), new EnumMap<>(a.getTriagem()),
                a.getAchados().stream().map(AchadoDto::de).toList(), a.getCriadoEm(), a.getCriadoPor(),
                a.getAlteradoEm(), a.getAlteradoPor());
    }
}
