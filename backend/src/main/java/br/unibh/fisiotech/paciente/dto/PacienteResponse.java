package br.unibh.fisiotech.paciente.dto;

import br.unibh.fisiotech.shared.dto.Alteracao;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import br.unibh.fisiotech.paciente.entity.Paciente;

public record PacienteResponse(
        UUID id,
        UUID responsavelId,
        String nome,
        String sobrenome,
        String identificador,
        String email,
        LocalDate dataNascimento,
        Instant criadoEm,
        UUID criadoPor,
        Instant alteradoEm,
        UUID alteradoPor,
        List<Alteracao> alteracoes) {

    public static PacienteResponse de(Paciente p) {
        return new PacienteResponse(p.getId(), p.getResponsavelId(), p.getNome(), p.getSobrenome(), p.getIdentificador(),
                p.getEmail(), p.getDataNascimento(), p.getCriadoEm(), p.getCriadoPor(), p.getAlteradoEm(),
                p.getAlteradoPor(),
                p.getAlteracoes().stream().sorted(Comparator.comparing(Alteracao::dataHora)).toList());
    }
}
