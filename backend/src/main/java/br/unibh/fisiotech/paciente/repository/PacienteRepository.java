package br.unibh.fisiotech.paciente.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.unibh.fisiotech.paciente.entity.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    Optional<Paciente> findByIdAndResponsavelId(UUID id, UUID responsavelId);

    boolean existsByResponsavelIdAndIdentificadorIgnoreCase(UUID responsavelId, String identificador);

    boolean existsByResponsavelIdAndIdentificadorIgnoreCaseAndIdNot(UUID responsavelId, String identificador, UUID id);

    /**
     * Consulta nativa porque o JPQL não tem o operador {@code @@}. {@code consulta} já vem no formato do
     * {@code to_tsquery} (termos com prefixo {@code :*}); nulo lista todos. A ordenação vem do {@code Pageable},
     * com nomes de coluna.
     */
    @Query(value = """
            select * from paciente
            where responsavel_id = :responsavel and excluido_em is null
              and (cast(:consulta as text) is null or busca @@ to_tsquery('simple', public.sem_acento(cast(:consulta as text))))
            """, countQuery = """
            select count(*) from paciente
            where responsavel_id = :responsavel and excluido_em is null
              and (cast(:consulta as text) is null or busca @@ to_tsquery('simple', public.sem_acento(cast(:consulta as text))))
            """, nativeQuery = true)
    Page<Paciente> buscar(@Param("responsavel") UUID responsavel, @Param("consulta") String consulta,
            Pageable pageable);
}
