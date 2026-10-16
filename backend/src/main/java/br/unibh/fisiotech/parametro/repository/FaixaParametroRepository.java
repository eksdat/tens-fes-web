package br.unibh.fisiotech.parametro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.entity.FaixaParametro;

public interface FaixaParametroRepository extends JpaRepository<FaixaParametro, Long> {

    @EntityGraph(attributePaths = "parametro")
    List<FaixaParametro> findByModalidadeOrderByIdAsc(Modalidade modalidade);
}
