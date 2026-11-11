package br.unibh.fisiotech.conteudo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** O motivo volta para quem escreveu: precisa dizer o que corrigir. */
public record DevolucaoRequest(
        @NotBlank(message = "Escreva o motivo da devolução.")
        @Size(max = 500, message = "Use até 500 caracteres.") String motivo) {
}
