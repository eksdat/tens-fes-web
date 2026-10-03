package br.unibh.tensfes.conteudo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConteudoRepository extends JpaRepository<Conteudo, UUID> {

    List<Conteudo> findByModalidadeInAndEstadoOrderByOrdemAscTituloAsc(List<Modalidade> modalidades, EstadoEditorial estado);

    Optional<Conteudo> findByIdAndEstado(UUID id, EstadoEditorial estado);
}
