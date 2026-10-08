package br.unibh.fisiotech.usuario.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Uf;

public record AtualizarPerfilProfissionalRequest(
        @NotNull(message = "Escolha sua categoria profissional.")
        Categoria categoria,

        @NotBlank(message = "Informe o número do registro.")
        @Size(max = 20, message = "Use no máximo 20 caracteres.")
        @Pattern(regexp = CadastroRequest.TEXTO_SEGURO, message = "Use só letras, números e . - ' ( ) /, sem links.")
        String registro,

        @NotNull(message = "Escolha a UF do registro.")
        Uf uf) {

    @AssertTrue(message = "Registro fora do formato da categoria.")
    boolean isRegistroNoFormato() {
        return categoria == null || registro == null || categoria.aceitaRegistro(registro.trim());
    }
}
