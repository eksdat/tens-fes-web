package br.unibh.fisiotech.usuario.dto;

import java.util.UUID;

import br.unibh.fisiotech.usuario.entity.Usuario;
import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.enums.Uf;

public record UsuarioResponse(
        UUID id,
        String nome,
        Perfil perfil,
        boolean revisor,
        String instituicao,
        Short periodo,
        Categoria categoria,
        String registro,
        Uf uf) {

    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getPerfil(), u.isRevisor(), u.getInstituicao(),
                u.getPeriodo(), u.getCategoria(), u.getRegistro(), u.getUf());
    }
}
