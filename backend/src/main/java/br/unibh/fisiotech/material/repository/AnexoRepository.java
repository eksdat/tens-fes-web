package br.unibh.fisiotech.material.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.material.entity.Anexo;

public interface AnexoRepository extends JpaRepository<Anexo, UUID> {

    List<Anexo> findByConteudoIdInOrderByCriadoEmAsc(Collection<Long> conteudoIds);

    Optional<Anexo> findByIdAndConteudoId(UUID id, Long conteudoId);

    long countByConteudoId(Long conteudoId);
}
