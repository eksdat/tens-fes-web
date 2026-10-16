package br.unibh.fisiotech.usuario.dto;

import jakarta.validation.constraints.AssertTrue;

public record AceiteTermosRequest(
        @AssertTrue(message = "Aceite os termos de uso e a política de privacidade.") Boolean aceite) {
}
