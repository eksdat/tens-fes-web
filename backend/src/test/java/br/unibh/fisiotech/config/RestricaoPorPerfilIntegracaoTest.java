package br.unibh.fisiotech.config;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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
                .header("alg", "ES256").subject(i.getArgument(0)).claim("aal", "aal2")
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
                .andExpect(status().isOk());
    }

    @Test
    void deveNegarCasosParaProfissional() throws Exception {
        cadastrar(PROFISSIONAL);
        mvc.perform(get("/api/v1/casos-clinicos").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveListarCasosParaEstudante() throws Exception {
        cadastrar(ESTUDANTE);
        mvc.perform(get("/api/v1/casos-clinicos").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk());
    }

    @Test
    void deveDarAcessoAoCasoEAnexoSomenteAoEstudanteQueEnviou() throws Exception {
        cadastrar(ESTUDANTE);
        var caso = new MockMultipartFile("caso", "", "application/json", """
                {"titulo":"Caso fictício","objetivo":"Estudo","contexto":"Simulado","avaliacao":"Fictícia",
                 "modalidade":"TENS","parametros":"A discutir","montagem":"Simulada",
                 "justificativa":"Exercício","duvida":"Qual a fonte?"}
                """.getBytes(StandardCharsets.UTF_8));
        byte[] pdf = "%PDF-1.7".getBytes(StandardCharsets.US_ASCII);
        var anexo = new MockMultipartFile("anexos", "caso.pdf", "application/pdf", pdf);

        var resposta = mvc.perform(multipart("/api/v1/casos-clinicos").file(caso).file(anexo)
                        .header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String caminho = "/api/v1/casos-clinicos/" + JsonPath.parse(resposta).read("$", String.class);
        var detalhe = mvc.perform(get(caminho).header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caso.titulo").value("Caso fictício"))
                .andExpect(jsonPath("$.anexos[0].nome").value("caso.pdf"))
                .andReturn().getResponse().getContentAsString();
        String caminhoAnexo = caminho + "/anexos/" + JsonPath.read(detalhe, "$.anexos[0].id");
        mvc.perform(get(caminhoAnexo).header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk()).andExpect(content().bytes(pdf));

        sub = UUID.randomUUID().toString();
        cadastrar(ESTUDANTE);
        mvc.perform(get(caminho).header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isNotFound());
        mvc.perform(get(caminhoAnexo).header(HttpHeaders.AUTHORIZATION, bearer()))
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
