package br.unibh.fisiotech.config;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.unibh.fisiotech.TestcontainersConfiguration;

/**
 * Mesma regra com o fluxo real: o perfil vem da tabela usuario (PerfilJwtConverter), não do token.
 * Só o JwtDecoder é simulado, como no UsuarioIntegracaoTest.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class RestricaoPorPerfilIntegracaoTest {

    private static final String ESTUDANTE = """
            {"aceiteTermos":true,"nome":"Ana Souza","perfil":"ESTUDANTE","instituicao":"UniBH","periodo":5}
            """;

    private static final String PROFISSIONAL = """
            {"aceiteTermos":true,"nome":"Bia Lima","perfil":"PROFISSIONAL","categoria":"FISIOTERAPEUTA","registro":"123456-F","uf":"MG"}
            """;

    @Autowired
    private MockMvc mvc;

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

    @Test
    void deveNegarPacientesParaEstudanteCadastrado() throws Exception {
        cadastrar(ESTUDANTE);

        mvc.perform(get("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveDeixarProfissionalCadastradoPassarPelaSeguranca() throws Exception {
        cadastrar(PROFISSIONAL);

        mvc.perform(get("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isNotFound());
    }

    private void cadastrar(String json) throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer())
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
    }

    private String bearer() {
        return "Bearer " + sub;
    }
}
