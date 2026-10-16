package br.unibh.fisiotech.paciente;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.jayway.jsonpath.JsonPath;

import br.unibh.fisiotech.TestcontainersConfiguration;

/**
 * Pacientes com PostgreSQL real. O token simulado é "sub" ou "sub~aal1"; sem sufixo, a sessão é aal2 (MFA).
 * Cada teste cria profissionais novos, então os dados de um não interferem no outro.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class PacienteIntegracaoTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private String profissionalA;
    private String profissionalB;

    @BeforeEach
    void setUp() throws Exception {
        when(jwtDecoder.decode(anyString())).thenAnswer(i -> {
            String[] partes = i.<String>getArgument(0).split("~");
            return Jwt.withTokenValue(i.getArgument(0)).header("alg", "ES256").subject(partes[0])
                    .claim("aal", partes.length > 1 ? partes[1] : "aal2")
                    .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        });
        profissionalA = cadastrarProfissional("Bia Lima");
        profissionalB = cadastrarProfissional("Caio Reis");
    }

    @Test
    void deveCadastrarPacienteComOResponsavelDoToken() throws Exception {
        criar(profissionalA, paciente("Maria", "A-001"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome").value("Maria"))
                .andExpect(jsonPath("$.criadoPor").value(profissionalA))
                .andExpect(jsonPath("$.alteradoPor").value(profissionalA));
    }

    @Test
    void deveIgnorarResponsavelEnviadoNoCorpo() throws Exception {
        var corpo = paciente("Maria", "A-002").replace("{", "{\"responsavelId\":\"" + profissionalB + "\",");
        var id = idDe(criar(profissionalA, corpo));

        buscar(profissionalA, id).andExpect(status().isOk());
        buscar(profissionalB, id).andExpect(status().isNotFound());
    }

    @Test
    void deveResponder404QuandoOutroProfissionalBuscaAlteraOuExcluiOPaciente() throws Exception {
        var id = idDe(criar(profissionalA, paciente("Maria", "A-003")));

        buscar(profissionalB, id).andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/pacientes/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalB)
                        .contentType(MediaType.APPLICATION_JSON).content(paciente("Outra", "B-003")))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/pacientes/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalB))
                .andExpect(status().isNotFound());
        buscar(profissionalA, id).andExpect(jsonPath("$.nome").value("Maria"));
    }

    @Test
    void deveListarSoOsPacientesDoProfissionalLogado() throws Exception {
        criar(profissionalA, paciente("Maria", "A-004"));
        criar(profissionalB, paciente("Joana", "B-004"));

        listar(profissionalA, "")
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].nome").value("Maria"))
                .andExpect(jsonPath("$.totalItens").value(1));
    }

    @Test
    void deveRecusarIdentificadorRepetidoSoNoMesmoProfissional() throws Exception {
        criar(profissionalA, paciente("Maria", "X-1")).andExpect(status().isCreated());

        criar(profissionalA, paciente("Joana", "X-1")).andExpect(status().isConflict());
        criar(profissionalB, paciente("Joana", "X-1")).andExpect(status().isCreated());
    }

    @Test
    void deveBuscarPorPrefixoSemAcentoESemMaiuscula() throws Exception {
        criar(profissionalA, paciente("José", "A-010"));
        criar(profissionalA, paciente("Ana", "A-011"));

        listar(profissionalA, "busca=JOS").andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].nome").value("José"));
        listar(profissionalA, "busca=jose").andExpect(jsonPath("$.itens", hasSize(1)));
    }

    @Test
    void deveBuscarPeloIdentificador() throws Exception {
        criar(profissionalA, paciente("José", "CASO-77"));
        criar(profissionalA, paciente("Ana", "CASO-12"));

        listar(profissionalA, "busca=caso-77").andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].identificador").value("CASO-77"));
    }

    @Test
    void deveOrdenarPelaColunaEscolhidaNosDoisSentidos() throws Exception {
        criar(profissionalA, paciente("Bruno", "A-020"));
        criar(profissionalA, paciente("Ana", "A-021"));
        criar(profissionalA, paciente("Carla", "A-022"));

        listar(profissionalA, "").andExpect(jsonPath("$.itens[0].nome").value("Ana"));
        listar(profissionalA, "ordenar=nome&direcao=desc").andExpect(jsonPath("$.itens[0].nome").value("Carla"));
        listar(profissionalA, "ordenar=identificador&direcao=desc")
                .andExpect(jsonPath("$.itens[0].identificador").value("A-022"));
    }

    @Test
    void deveRecusarOrdenacaoPorCampoForaDaLista() throws Exception {
        listar(profissionalA, "ordenar=responsavel_id").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Requisição inválida."));
    }

    @Test
    void devePaginar() throws Exception {
        criar(profissionalA, paciente("Ana", "P-1"));
        criar(profissionalA, paciente("Bruno", "P-2"));
        criar(profissionalA, paciente("Carla", "P-3"));

        listar(profissionalA, "tamanho=2&pagina=1")
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].nome").value("Carla"))
                .andExpect(jsonPath("$.totalPaginas").value(2));
    }

    @Test
    void deveRegistrarQuemAlterou() throws Exception {
        var id = idDe(criar(profissionalA, paciente("Maria", "A-030")));

        mvc.perform(put("/api/v1/pacientes/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA)
                        .contentType(MediaType.APPLICATION_JSON).content(paciente("Mariana", "A-030")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Mariana"))
                .andExpect(jsonPath("$.alteradoPor").value(profissionalA))
                .andExpect(jsonPath("$.alteradoEm", notNullValue()));
    }

    @Test
    void deveEsconderPacienteExcluidoESoMarcarAExclusao() throws Exception {
        var id = idDe(criar(profissionalA, paciente("Maria", "A-040")));

        mvc.perform(delete("/api/v1/pacientes/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA))
                .andExpect(status().isNoContent());

        buscar(profissionalA, id).andExpect(status().isNotFound());
        listar(profissionalA, "").andExpect(jsonPath("$.itens", hasSize(0)));
        Integer marcados = jdbc.queryForObject(
                "select count(*) from paciente where id = ?::uuid and excluido_em is not null", Integer.class, id);
        org.assertj.core.api.Assertions.assertThat(marcados).isEqualTo(1);
    }

    @Test
    void deveRecusarDadosInvalidos() throws Exception {
        criar(profissionalA, """
                {"nome":"","sobrenome":"Silva","identificador":"A-050",
                 "email":"nao-e-email","dataNascimento":"2999-01-01"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome", notNullValue()))
                .andExpect(jsonPath("$.erros.email", notNullValue()))
                .andExpect(jsonPath("$.erros.dataNascimento", notNullValue()));
    }

    @Test
    void deveRecusarNomeComDigitoIdentificadorComCaraDeCpfENascimentoAntesDe1900() throws Exception {
        criar(profissionalA, """
                {"nome":"Maria2","sobrenome":"Silva","identificador":"123.456.789-01",
                 "email":"joao@teste","dataNascimento":"1850-01-01"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome", notNullValue()))
                .andExpect(jsonPath("$.erros.email", notNullValue()));
        criar(profissionalA, paciente("Maria", "12345678901")).andExpect(status().isBadRequest());
        criar(profissionalA, paciente("Maria", "A-070").replace("1980-05-10", "1850-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveNaoGuardarNemDevolverTelefone() throws Exception {
        criar(profissionalA, paciente("Maria", "A-080").replace("{", "{\"telefone\":\"(31) 99999-0000\","))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.telefone").doesNotExist());
    }

    @Test
    void deveAceitarPacienteSemEmail() throws Exception {
        criar(profissionalA, paciente("Maria", "A-060").replace("\"email\":\"maria@exemplo.com\",", ""))
                .andExpect(status().isCreated());
    }

    @Test
    void deveExigirVerificacaoEmDuasEtapas() throws Exception {
        mvc.perform(get("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA + "~aal1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveNegarPacientesParaEstudante() throws Exception {
        var estudante = UUID.randomUUID().toString();
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + estudante)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"aceiteTermos":true,"nome":"Ana Souza","perfil":"ESTUDANTE","instituicao":"UniBH","periodo":5}
                        """)).andExpect(status().isCreated());

        criar(estudante, paciente("Maria", "E-1")).andExpect(status().isForbidden());
        listar(estudante, "").andExpect(status().isForbidden());
    }

    private String cadastrarProfissional(String nome) throws Exception {
        var sub = UUID.randomUUID().toString();
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + sub)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"aceiteTermos":true,"nome":"%s","perfil":"PROFISSIONAL","categoria":"FISIOTERAPEUTA","registro":"123456-F","uf":"MG"}
                        """.formatted(nome))).andExpect(status().isCreated());
        return sub;
    }

    private static String paciente(String nome, String identificador) {
        return """
                {"nome":"%s","sobrenome":"Silva","identificador":"%s",
                 "email":"maria@exemplo.com","dataNascimento":"1980-05-10"}
                """.formatted(nome, identificador);
    }

    private ResultActions criar(String sub, String corpo) throws Exception {
        return mvc.perform(post("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, "Bearer " + sub)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions buscar(String sub, String id) throws Exception {
        return mvc.perform(get("/api/v1/pacientes/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + sub));
    }

    private ResultActions listar(String sub, String query) throws Exception {
        return mvc.perform(get("/api/v1/pacientes?" + query).header(HttpHeaders.AUTHORIZATION, "Bearer " + sub));
    }

    private static String idDe(ResultActions resultado) throws Exception {
        return JsonPath.read(resultado.andReturn().getResponse().getContentAsString(), "$.id");
    }
}
