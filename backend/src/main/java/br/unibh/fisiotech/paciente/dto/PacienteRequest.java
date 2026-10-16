package br.unibh.fisiotech.paciente.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** O responsável não vem aqui: é sempre o usuário do token. */
public record PacienteRequest(
        @NotBlank(message = "Informe o nome.") @Size(max = 80, message = "Use até 80 caracteres.") String nome,
        @NotBlank(message = "Informe o sobrenome.") @Size(max = 120, message = "Use até 120 caracteres.") String sobrenome,
        @NotBlank(message = "Informe o identificador.") @Size(max = 40, message = "Use até 40 caracteres.") String identificador,
        @NotBlank(message = "Informe o telefone.")
        @Pattern(regexp = "^[0-9()+\\- ]{8,20}$", message = "Use só números, espaço, parênteses, + e -.") String telefone,
        @Email(message = "E-mail inválido.") @Size(max = 254, message = "Use até 254 caracteres.") String email,
        @NotNull(message = "Informe a data de nascimento.")
        @PastOrPresent(message = "A data de nascimento não pode estar no futuro.") LocalDate dataNascimento) {
}
