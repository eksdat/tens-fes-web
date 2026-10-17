package br.unibh.fisiotech.sessao.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.sessao.entity.Sessao;

public interface SessaoRepository extends JpaRepository<Sessao, UUID> {

    List<Sessao> findByPacienteIdOrderByDataHoraDesc(UUID pacienteId);

    Optional<Sessao> findByIdAndPacienteId(UUID id, UUID pacienteId);
}
