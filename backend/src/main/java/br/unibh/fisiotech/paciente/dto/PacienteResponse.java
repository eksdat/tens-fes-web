package br.unibh.fisiotech.paciente.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import br.unibh.fisiotech.paciente.entity.Paciente;

public record PacienteResponse(
        UUID id,
        String nome,
        String sobrenome,
        String identificador,
        String email,
        LocalDate dataNascimento,
        Instant criadoEm,
        UUID criadoPor,
        Instant alteradoEm,
        UUID alteradoPor) {

    public static PacienteResponse de(Paciente p) {
        return new PacienteResponse(p.getId(), p.getNome(), p.getSobrenome(), p.getIdentificador(),
                p.getEmail(), p.getDataNascimento(), p.getCriadoEm(), p.getCriadoPor(), p.getAlteradoEm(),
                p.getAlteradoPor());
    }
}
