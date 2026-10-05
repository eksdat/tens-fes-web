package br.unibh.fisiotech.conteudo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;

public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {

    List<Conteudo> findByModalidadeInAndEstadoOrderByIdAsc(List<Modalidade> modalidades,
            EstadoEditorial estado);

    Optional<Conteudo> findByIdAndEstado(Long id, EstadoEditorial estado);
}
