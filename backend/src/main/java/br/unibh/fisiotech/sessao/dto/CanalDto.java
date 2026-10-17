package br.unibh.fisiotech.sessao.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.sessao.entity.Canal;

/**
 * Limites físicos amplos (não clínicos): só barram erro de digitação e de unidade. @Digits espelha o numeric(_,1) do
 * banco: sem ele, 2.55 era arredondado em silêncio e 0.04 virava 0.0, violava o check e voltava 500.
 */
public record CanalDto(
        @NotNull(message = "Informe o canal.") @Min(1) @Max(2) Short canal,
        @NotNull(message = "Informe a frequência em Hz.")
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("1000") @Digits(integer = 4, fraction = 1, message = "Use no máximo uma casa decimal.") BigDecimal frequenciaHz,
        @NotNull(message = "Informe a largura de pulso em µs.") @Min(1) @Max(1000) Integer larguraPulsoUs,
        @DecimalMin("0") @DecimalMax("100") @Digits(integer = 3, fraction = 1, message = "Use no máximo uma casa decimal.") BigDecimal amplitudeInicialMa,
        @NotNull(message = "Informe a amplitude final em mA.") @DecimalMin("0") @DecimalMax("100")
        @Digits(integer = 3, fraction = 1, message = "Use no máximo uma casa decimal.") BigDecimal amplitudeFinalMa,
        @NotBlank(message = "Informe o par de eletrodos.") @Size(max = 20) String par) {

    public Canal paraEntidade() {
        return new Canal(canal, frequenciaHz, larguraPulsoUs, amplitudeInicialMa, amplitudeFinalMa, par.trim());
    }

    public static CanalDto de(Canal c) {
        return new CanalDto(c.canal(), c.frequenciaHz(), c.larguraPulsoUs(), c.amplitudeInicialMa(),
                c.amplitudeFinalMa(), c.par());
    }
}
