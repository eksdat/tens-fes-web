package br.unibh.fisiotech.sessao.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlanejamentoDto(
        @NotBlank(message = "Informe o relato do planejamento.") @Size(max = 1000) String relato,
        @Valid ReferenciaDto referencia,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("10000") Integer larguraPulsoUs) {

    public record ReferenciaDto(
            @NotBlank @Size(max = 100) String id,
            @NotBlank @Size(max = 40) String versao,
            @NotBlank @Size(max = 200) String titulo,
            @NotBlank @Size(max = 500) String url) {
    }
}
