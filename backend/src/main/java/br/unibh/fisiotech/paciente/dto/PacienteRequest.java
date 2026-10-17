package br.unibh.fisiotech.paciente.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * O responsável não vem aqui: é sempre o usuário do token. Sem telefone (minimização). As mesmas regras estão no
 * formulário ({@code PacienteFormPage.tsx}, {@code formatar.ts}), mas quem decide é este DTO.
 */
public record PacienteRequest(
        @NotBlank(message = "Informe o nome.") @Size(max = 80, message = "Use até 80 caracteres.")
        @Pattern(regexp = NOME, message = "Use só letras.") String nome,
        @NotBlank(message = "Informe o sobrenome.") @Size(max = 120, message = "Use até 120 caracteres.")
        @Pattern(regexp = NOME, message = "Use só letras.") String sobrenome,
        @NotBlank(message = "Informe o identificador.") @Size(max = 40, message = "Use até 40 caracteres.")
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Use letras sem acento, números e hífen.") String identificador,
        @Email(message = "Informe um e-mail válido, como nome@exemplo.com.")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Informe um e-mail válido, como nome@exemplo.com.")
        @Size(max = 254, message = "Use até 254 caracteres.") String email,
        @NotNull(message = "Informe a data de nascimento.")
        @PastOrPresent(message = "A data de nascimento não pode estar no futuro.") LocalDate dataNascimento) {

    /** Letras (com acento), espaço, apóstrofo e hífen; começa por letra. */
    static final String NOME = "^\\p{L}[\\p{L}\\s'’-]*$";

    private static final LocalDate NASCIMENTO_MINIMO = LocalDate.of(1900, 1, 1);

    /** 11 dígitos, com ou sem pontuação, parecem CPF: o ambiente é acadêmico. */
    @JsonIgnore
    @AssertTrue(message = "Parece um documento (CPF). Use um código interno, como CASO-01.")
    public boolean isIdentificadorSemCaraDeDocumento() {
        return identificador == null || !identificador.replaceAll("[.\\-/\\s]", "").matches("\\d{11}");
    }

    @JsonIgnore
    @AssertTrue(message = "Confira o ano: use uma data a partir de 1900.")
    public boolean isNascimentoPlausivel() {
        return dataNascimento == null || !dataNascimento.isBefore(NASCIMENTO_MINIMO);
    }
}
