package br.unibh.fisiotech.usuario.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

import br.unibh.fisiotech.usuario.enums.Categoria;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.enums.Uf;

class CadastroRequestTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private boolean valido(CadastroRequest req) {
        return validator.validate(req).isEmpty();
    }

    private static CadastroRequest profissional(Categoria categoria, String registro) {
        return new CadastroRequest("Bia Lima", Perfil.PROFISSIONAL, null, null, categoria, registro, Uf.MG, true);
    }

    @Test
    void deveAceitarEstudanteCompleto() {
        assertThat(valido(new CadastroRequest("Ana Souza", Perfil.ESTUDANTE, "UniBH", (short) 5, null, null, null, true)))
                .isTrue();
    }

    @Test
    void deveRecusarEstudanteSemPeriodo() {
        assertThat(valido(new CadastroRequest("Ana Souza", Perfil.ESTUDANTE, "UniBH", null, null, null, null, true)))
                .isFalse();
    }

    @Test
    void deveRecusarProfissionalSemUf() {
        assertThat(valido(new CadastroRequest("Bia Lima", Perfil.PROFISSIONAL, null, null,
                Categoria.FISIOTERAPEUTA, "123456-F", null, true))).isFalse();
    }

    @Test
    void deveRecusarFisioterapeutaComRegistroSemSufixoF() {
        assertThat(valido(profissional(Categoria.FISIOTERAPEUTA, "123456-TO"))).isFalse();
    }

    @Test
    void deveAceitarTerapeutaOcupacionalComSufixoTO() {
        assertThat(valido(profissional(Categoria.TERAPEUTA_OCUPACIONAL, "98765-TO"))).isTrue();
    }

    @Test
    void deveAceitarRegistroLivreParaCategoriaOutra() {
        assertThat(valido(profissional(Categoria.OUTRA, "CRM 4567"))).isTrue();
    }

    @Test
    void deveRecusarCadastroSemAceiteDosTermos() {
        assertThat(valido(new CadastroRequest("Ana Souza", Perfil.ESTUDANTE, "UniBH", (short) 5, null, null, null,
                false))).isFalse();
        assertThat(valido(new CadastroRequest("Ana Souza", Perfil.ESTUDANTE, "UniBH", (short) 5, null, null, null,
                null))).isFalse();
    }

    @Test
    void deveRecusarNomeComLink() {
        assertThat(valido(new CadastroRequest("Ganhe www.premio.com", Perfil.ESTUDANTE, "UniBH", (short) 5,
                null, null, null, true))).isFalse();
    }
}
