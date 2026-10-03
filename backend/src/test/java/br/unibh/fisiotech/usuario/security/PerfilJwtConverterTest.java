package br.unibh.fisiotech.usuario.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import br.unibh.fisiotech.usuario.entity.Usuario;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class PerfilJwtConverterTest {

    private static final UUID ID = UUID.randomUUID();

    @Mock
    private UsuarioRepository repository;

    private Jwt token() {
        return Jwt.withTokenValue("t").header("alg", "ES256").subject(ID.toString())
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
    }

    private Usuario usuario(Perfil perfil, boolean revisor, boolean ativo) {
        var u = new Usuario(ID, "Nome", perfil);
        ReflectionTestUtils.setField(u, "revisor", revisor);
        ReflectionTestUtils.setField(u, "ativo", ativo);
        return u;
    }

    private Iterable<String> papeis() {
        return new PerfilJwtConverter(repository).convert(token()).getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();
    }

    @Test
    void deveDarPapelDoPerfilAoEstudante() {
        when(repository.findById(ID)).thenReturn(Optional.of(usuario(Perfil.ESTUDANTE, false, true)));

        assertThat(papeis()).containsExactly("ROLE_ESTUDANTE");
    }

    @Test
    void deveIncluirPapelRevisorAoProfissionalRevisor() {
        when(repository.findById(ID)).thenReturn(Optional.of(usuario(Perfil.PROFISSIONAL, true, true)));

        assertThat(papeis()).containsExactlyInAnyOrder("ROLE_PROFISSIONAL", "ROLE_REVISOR");
    }

    @Test
    void deveDeixarSemPapelQuemAindaNaoCompletouCadastro() {
        when(repository.findById(ID)).thenReturn(Optional.empty());

        assertThat(papeis()).isEmpty();
    }

    @Test
    void deveDeixarSemPapelUsuarioInativo() {
        when(repository.findById(ID)).thenReturn(Optional.of(usuario(Perfil.PROFISSIONAL, false, false)));

        assertThat(papeis()).isEmpty();
    }
}
