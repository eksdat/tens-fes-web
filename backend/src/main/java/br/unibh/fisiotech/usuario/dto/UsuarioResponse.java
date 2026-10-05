package br.unibh.fisiotech.usuario.dto;

import java.util.UUID;

import br.unibh.fisiotech.usuario.entity.Usuario;
import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.enums.Uf;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

/**
 * Usuário logado. {@code id}, {@code nome}, {@code perfil} e {@code revisor} sempre vêm preenchidos; os demais
 * dependem do perfil. O {@code requiredMode} deixa o contrato OpenAPI (e os tipos do frontend) fiéis a isso.
 */
public record UsuarioResponse(
        @Schema(requiredMode = RequiredMode.REQUIRED) UUID id,
        @Schema(requiredMode = RequiredMode.REQUIRED) String nome,
        @Schema(requiredMode = RequiredMode.REQUIRED) Perfil perfil,
        @Schema(requiredMode = RequiredMode.REQUIRED) boolean revisor,
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
