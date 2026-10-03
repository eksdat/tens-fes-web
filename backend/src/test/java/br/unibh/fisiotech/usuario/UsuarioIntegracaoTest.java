package br.unibh.fisiotech.usuario;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.unibh.fisiotech.TestcontainersConfiguration;

/**
 * Fluxo completo com PostgreSQL real (Testcontainers): Flyway, segurança, conversor de perfil e banco.
 * Só o {@link JwtDecoder} é simulado, para não depender do Supabase: o token é o próprio {@code sub}.
 */
@SpringBootTest(properties = "SUPABASE_URL=https://teste.supabase.co")
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class UsuarioIntegracaoTest {

    private static final String ESTUDANTE = """
            {"nome":"Ana Souza","perfil":"ESTUDANTE","instituicao":"UniBH","periodo":5}
            """;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private String sub;

    @BeforeEach
    void setUp() {
        sub = UUID.randomUUID().toString();
        when(jwtDecoder.decode(anyString())).thenAnswer(i -> Jwt.withTokenValue(i.getArgument(0))
                .header("alg", "ES256").subject(i.getArgument(0))
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build());
    }

    private String bearer() {
        return "Bearer " + sub;
    }

    @Test
    void deveGravarEstudanteEDevolverNoMe() throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(ESTUDANTE))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("ESTUDANTE"))
                .andExpect(jsonPath("$.periodo").value(5))
                .andExpect(jsonPath("$.revisor").value(false));
    }

    @Test
    void deveResponder409NoSegundoCadastroDoMesmoUsuario() throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer())
                .contentType(MediaType.APPLICATION_JSON).content(ESTUDANTE))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(ESTUDANTE))
                .andExpect(status().isConflict());
    }

    @Test
    void deveResponder404NoMeAntesDeCompletarCadastro() throws Exception {
        mvc.perform(get("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveNegarRotaComPerfilParaQuemNaoCompletouCadastro() throws Exception {
        mvc.perform(get("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveNegarRotaComPerfilParaUsuarioInativo() throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer())
                .contentType(MediaType.APPLICATION_JSON).content(ESTUDANTE));
        jdbc.update("update usuario set ativo = false where id = ?::uuid", sub);

        mvc.perform(get("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveBarrarNoBancoProfissionalSemRegistro() {
        assertThatThrownBy(() -> jdbc.update(
                "insert into usuario (id, nome, perfil, categoria, uf) values (?::uuid, 'Bia', 'PROFISSIONAL', 'FISIOTERAPEUTA', 'MG')",
                sub)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoRevisorQueNaoEProfissional() {
        assertThatThrownBy(() -> jdbc.update(
                "insert into usuario (id, nome, perfil, revisor, instituicao, periodo) values (?::uuid, 'Ana', 'ESTUDANTE', true, 'UniBH', 5)",
                sub)).isInstanceOf(DataIntegrityViolationException.class);
    }
}
