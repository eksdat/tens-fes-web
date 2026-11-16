package br.unibh.fisiotech.conteudo.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {

    List<Conteudo> findByModalidadeInAndEstadoOrderByIdAsc(List<Modalidade> modalidades,
            EstadoEditorial estado);

    Optional<Conteudo> findByIdAndEstado(Long id, EstadoEditorial estado);

    List<Conteudo> findByModalidadeAndSecaoAndBlocoIsNotNull(Modalidade modalidade, Secao secao);

    List<Conteudo> findByEstado(EstadoEditorial estado);

    /**
     * Lê travando a linha até o fim da transação ({@code select ... for update}). Duas decisões ao mesmo tempo sobre o
     * mesmo texto: a segunda espera a primeira gravar e lê o estado novo, em vez de sobrescrever a decisão.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Conteudo c where c.id = :id")
    Optional<Conteudo> buscarParaDecidir(@Param("id") Long id);

    List<Conteudo> findByAutorIdOrderByAtualizadoEmDesc(UUID autorId);

    Optional<Conteudo> findByIdAndAutorId(Long id, UUID autorId);
}
