package br.unibh.fisiotech.avaliacao.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.ItemTriagem;

/**
 * Item de triagem omitido vira NAO_AVALIADO. Dor omitida fica nula (não avaliada), nunca zero. Queixa e objetivo são
 * obrigatórios: a avaliação existe para definir um objetivo mensurável antes de aplicar (card da avaliação inicial).
 */
public record AvaliacaoRequest(
        @NotNull(message = "Informe a data da avaliação.")
        @PastOrPresent(message = "A data não pode estar no futuro.") LocalDate dataAvaliacao,
        @NotBlank(message = "Descreva a queixa.") @Size(max = 2000, message = "Use até 2000 caracteres.") String queixa,
        @Size(max = 2000) String historico,
        @Min(value = 0, message = "Use a escala de 0 a 10.") @Max(value = 10, message = "Use a escala de 0 a 10.") Short dorEscala,
        @Size(max = 500) String dorContexto,
        @Size(max = 500) String dorTarefa,
        @Size(max = 500) String dorMomento,
        @NotBlank(message = "Informe o objetivo mensurável.") @Size(max = 2000, message = "Use até 2000 caracteres.") String objetivo,
        @Size(max = 2000) String plano,
        Map<ItemTriagem, EstadoAchado> triagem,
        @Size(max = 50) List<@Valid @NotNull AchadoDto> achados) {

    private static final LocalDate DATA_MINIMA = LocalDate.of(1900, 1, 1);

    @JsonIgnore
    @AssertTrue(message = "Confira o ano: use uma data a partir de 1900.")
    public boolean isDataPlausivel() {
        return dataAvaliacao == null || !dataAvaliacao.isBefore(DATA_MINIMA);
    }

    /** Dor sem tarefa e momento não se compara entre sessões (guia, seção 19: medidas equivalentes). */
    @JsonIgnore
    @AssertTrue(message = "Com a dor informada, registre a tarefa e o momento da medida.")
    public boolean isDorComTarefaEMomento() {
        return dorEscala == null || (preenchido(dorTarefa) && preenchido(dorMomento));
    }

    private static boolean preenchido(String texto) {
        return texto != null && !texto.isBlank();
    }
}
