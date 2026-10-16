package br.unibh.fisiotech.avaliacao.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.ItemTriagem;

/** Item de triagem omitido vira NAO_AVALIADO. Dor omitida fica nula (não avaliada), nunca zero. */
public record AvaliacaoRequest(
        @NotNull(message = "Informe a data da avaliação.")
        @PastOrPresent(message = "A data não pode estar no futuro.") LocalDate dataAvaliacao,
        @Size(max = 2000) String queixa,
        @Size(max = 2000) String historico,
        @Min(value = 0, message = "Use a escala de 0 a 10.") @Max(value = 10, message = "Use a escala de 0 a 10.") Short dorEscala,
        @Size(max = 500) String dorContexto,
        @Size(max = 500) String dorTarefa,
        @Size(max = 500) String dorMomento,
        @Size(max = 2000) String objetivo,
        @Size(max = 2000) String plano,
        Map<ItemTriagem, EstadoAchado> triagem,
        @Size(max = 50) List<@Valid @NotNull AchadoDto> achados) {
}
