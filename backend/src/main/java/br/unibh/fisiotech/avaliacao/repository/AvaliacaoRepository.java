package br.unibh.fisiotech.avaliacao.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.avaliacao.entity.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {

    List<Avaliacao> findByPacienteId(UUID pacienteId, Sort sort);

    Optional<Avaliacao> findByIdAndPacienteId(UUID id, UUID pacienteId);
}
