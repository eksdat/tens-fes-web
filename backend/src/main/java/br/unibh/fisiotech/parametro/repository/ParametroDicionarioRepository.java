package br.unibh.fisiotech.parametro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.parametro.entity.ParametroDicionario;

public interface ParametroDicionarioRepository extends JpaRepository<ParametroDicionario, Long> {

    List<ParametroDicionario> findAllByOrderByIdAsc();
}
