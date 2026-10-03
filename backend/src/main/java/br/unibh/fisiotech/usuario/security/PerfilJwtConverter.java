package br.unibh.fisiotech.usuario.security;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.usuario.entity.Usuario;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;

/**
 * Converte o JWT do Supabase em papéis. O perfil vem da tabela {@code usuario}, nunca do token:
 * o {@code user_metadata} do Supabase pode ser alterado pelo próprio usuário.
 * Sem cadastro ou inativo: autenticado, porém sem papel.
 */
@Component
@RequiredArgsConstructor
public class PerfilJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UsuarioRepository repository;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        List<GrantedAuthority> papeis = repository.findById(UUID.fromString(Objects.requireNonNull(jwt.getSubject())))
                .filter(Usuario::isAtivo)
                .map(PerfilJwtConverter::papeisDe)
                .orElse(List.of());
        return new JwtAuthenticationToken(jwt, papeis, jwt.getSubject());
    }

    private static List<GrantedAuthority> papeisDe(Usuario u) {
        var papeis = new ArrayList<GrantedAuthority>();
        papeis.add(new SimpleGrantedAuthority("ROLE_" + u.getPerfil().name()));
        if (u.isRevisor()) {
            papeis.add(new SimpleGrantedAuthority("ROLE_REVISOR"));
        }
        return papeis;
    }
}
