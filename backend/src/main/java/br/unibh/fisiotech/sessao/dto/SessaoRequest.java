package br.unibh.fisiotech.sessao.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.avaliacao.enums.Lado;
import br.unibh.fisiotech.conteudo.enums.Modalidade;

/** Blocos do card: contexto, aplicação, eletrodos, resposta, resultado e encerramento (guia, seção 18). */
public record SessaoRequest(
        @NotNull(message = "Informe a data e a hora.") @PastOrPresent(message = "A sessão não pode estar no futuro.") Instant dataHora,
        @NotBlank(message = "Informe o objetivo desta sessão.") @Size(max = 500) String objetivo,
        @NotNull(message = "Informe a modalidade.") Modalidade modalidade,
        @NotBlank(message = "Informe o aparelho.") @Size(max = 120) String aparelho,
        @Size(max = 60) String modo,
        @NotNull(message = "Informe a duração real em minutos.")
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("240") @Digits(integer = 3, fraction = 1, message = "Use no máximo uma casa decimal.") BigDecimal duracaoRealMin,
        @NotEmpty(message = "Informe os parâmetros de ao menos um canal.") @Size(max = 2) List<@Valid @NotNull CanalDto> canais,
        @NotBlank(message = "Informe o tipo de eletrodo.") @Size(max = 80) String eletrodoTipo,
        @NotBlank(message = "Informe as dimensões do eletrodo.") @Size(max = 40) String eletrodoDimensoes,
        @NotNull(message = "Informe o lado.") Lado lado,
        @NotBlank(message = "Informe os marcos anatômicos.") @Size(max = 300) String marcos,
        @Size(max = 40) String montagemId,
        @Size(max = 500) String sensacao,
        @Size(max = 500) String contracao,
        @Size(max = 500) String tolerancia,
        @Size(max = 500) String fadiga,
        @Size(max = 500) String ajustes,
        @Size(max = 200) String medidaAntes,
        @Size(max = 200) String medidaDepois,
        @Size(max = 300) String medidaContexto,
        @NotBlank(message = "Informe a condição da pele.") @Size(max = 300) String condicaoPele,
        @NotBlank(message = "Informe o motivo do término.") @Size(max = 300) String motivoTermino,
        @NotBlank(message = "Informe o plano de reavaliação.") @Size(max = 500) String planoReavaliacao,
        /** Código fixo do item ("antes.objetivo-definido"); o texto da pergunta vive no frontend. */
        @Size(max = 40) Set<@Pattern(regexp = "^(antes|durante|depois)\\.[a-z0-9-]{1,60}$", message = "Item de checklist inválido.") String> checklist) {

    @JsonIgnore
    @AssertTrue(message = "Cada canal aparece uma vez.")
    public boolean isCanaisUnicos() {
        return canais == null || canais.stream().map(CanalDto::canal).distinct().count() == canais.size();
    }
}
