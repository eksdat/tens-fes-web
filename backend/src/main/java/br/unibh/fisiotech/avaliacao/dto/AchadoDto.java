package br.unibh.fisiotech.avaliacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.avaliacao.entity.Achado;
import br.unibh.fisiotech.avaliacao.enums.BlocoAchado;
import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.Lado;

/** Estado omitido vira NAO_AVALIADO no service. Lado, região e método são obrigatórios. */
public record AchadoDto(
        @NotNull(message = "Informe o bloco.") BlocoAchado bloco,
        @NotBlank(message = "Descreva o achado.") @Size(max = 200) String descricao,
        EstadoAchado estado,
        @NotNull(message = "Informe o lado.") Lado lado,
        @NotBlank(message = "Informe a região.") @Size(max = 100) String regiao,
        @NotBlank(message = "Informe o método.") @Size(max = 100) String metodo) {

    public static AchadoDto de(Achado a) {
        return new AchadoDto(a.bloco(), a.descricao(), a.estado(), a.lado(), a.regiao(), a.metodo());
    }
}
