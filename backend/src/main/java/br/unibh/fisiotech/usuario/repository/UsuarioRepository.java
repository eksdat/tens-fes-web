package br.unibh.fisiotech.usuario.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.unibh.fisiotech.usuario.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
}
