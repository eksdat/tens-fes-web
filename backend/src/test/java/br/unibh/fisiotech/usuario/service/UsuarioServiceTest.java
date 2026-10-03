package br.unibh.fisiotech.usuario.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.usuario.dto.CadastroRequest;
import br.unibh.fisiotech.usuario.entity.Usuario;
import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.enums.Uf;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    private static final UUID ID = UUID.randomUUID();

    @Mock
    private UsuarioRepository repository;

    @InjectMocks
    private UsuarioService service;

    private void salvaComoRecebido() {
        when(repository.saveAndFlush(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void deveCadastrarEstudanteComInstituicaoEPeriodo() {
        salvaComoRecebido();

        var resposta = service.cadastrar(ID,
                new CadastroRequest(" Ana Souza ", Perfil.ESTUDANTE, "UniBH", (short) 5, null, null, null));

        assertThat(resposta.id()).isEqualTo(ID);
        assertThat(resposta.nome()).isEqualTo("Ana Souza");
        assertThat(resposta.instituicao()).isEqualTo("UniBH");
        assertThat(resposta.periodo()).isEqualTo((short) 5);
    }

    @Test
    void deveCriarUsuarioSempreSemPermissaoDeRevisor() {
        salvaComoRecebido();

        var resposta = service.cadastrar(ID, new CadastroRequest("Bia Lima", Perfil.PROFISSIONAL, null, null,
                Categoria.FISIOTERAPEUTA, "123456-F", Uf.MG));

        assertThat(resposta.revisor()).isFalse();
    }

    @Test
    void deveDescartarCamposDeProfissionalNoCadastroDeEstudante() {
        salvaComoRecebido();

        var resposta = service.cadastrar(ID, new CadastroRequest("Ana Souza", Perfil.ESTUDANTE, "UniBH", (short) 5,
                Categoria.FISIOTERAPEUTA, "123456-F", Uf.MG));

        assertThat(resposta.categoria()).isNull();
        assertThat(resposta.registro()).isNull();
        assertThat(resposta.uf()).isNull();
    }

    @Test
    void deveRecusarSegundoCadastroDoMesmoUsuario() {
        when(repository.saveAndFlush(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("pk"));

        assertThatThrownBy(() -> service.cadastrar(ID,
                new CadastroRequest("Ana Souza", Perfil.ESTUDANTE, "UniBH", (short) 5, null, null, null)))
                .isInstanceOf(ConflitoException.class);
    }
}
