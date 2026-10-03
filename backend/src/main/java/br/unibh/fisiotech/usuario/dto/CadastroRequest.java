package br.unibh.fisiotech.usuario.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.enums.Uf;

public record CadastroRequest(
        @NotBlank @Size(min = 2, max = 120) @Pattern(regexp = TEXTO_SEGURO) String nome,
        @NotNull Perfil perfil,
        @Size(max = 120) @Pattern(regexp = TEXTO_SEGURO) String instituicao,
        @Min(1) @Max(12) Short periodo,
        Categoria categoria,
        @Size(max = 20) @Pattern(regexp = TEXTO_SEGURO) String registro,
        Uf uf) {

    /** Anti-spam no texto livre: só letras, números, espaço e {@code . - ' ( ) /}, sem {@code www.}. */
    static final String TEXTO_SEGURO = "(?i)(?!.*www\\.)[\\p{L}\\p{N} .'()/-]+";

    @AssertTrue(message = "Informe instituição e período.")
    boolean isDadosEstudanteCompletos() {
        return perfil != Perfil.ESTUDANTE || (instituicao != null && periodo != null);
    }

    @AssertTrue(message = "Informe categoria, registro e UF.")
    boolean isDadosProfissionalCompletos() {
        return perfil != Perfil.PROFISSIONAL || (categoria != null && registro != null && uf != null);
    }

    @AssertTrue(message = "Registro fora do formato da categoria.")
    boolean isRegistroNoFormato() {
        return perfil != Perfil.PROFISSIONAL || categoria == null || registro == null
                || categoria.aceitaRegistro(registro.trim());
    }
}
