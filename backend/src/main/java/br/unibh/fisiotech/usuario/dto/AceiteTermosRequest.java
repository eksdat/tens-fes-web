package br.unibh.fisiotech.usuario.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public record AceiteTermosRequest(
        @NotNull(message = "Aceite os termos de uso e a política de privacidade.")
        @AssertTrue(message = "Aceite os termos de uso e a política de privacidade.") Boolean aceite) {
}
