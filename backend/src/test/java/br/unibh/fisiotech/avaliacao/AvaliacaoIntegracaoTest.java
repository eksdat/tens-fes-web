package br.unibh.fisiotech.avaliacao;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
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
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.jayway.jsonpath.JsonPath;

import br.unibh.fisiotech.TestcontainersConfiguration;

/** Avaliação inicial (guia, seção 17) com PostgreSQL real. Token simulado: "sub" (aal2). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AvaliacaoIntegracaoTest {

    private static final String COMPLETA = """
            {"queixa":"Dor no joelho","objetivo":"Comparar a dor","dataAvaliacao":"2026-10-10","queixa":"Dor no joelho esquerdo ao subir escada.",
             "historico":"Sem cirurgias.","dorEscala":6,"dorContexto":"Subir escada","dorTarefa":"Subir 10 degraus",
             "dorMomento":"Antes da sessão","objetivo":"Comparar dor na mesma tarefa.","plano":"TENS convencional.",
             "triagem":{"GESTACAO":"AUSENTE","DISPOSITIVO_IMPLANTADO":"AUSENTE"},
             "achados":[{"bloco":"PELE_SENSIBILIDADE","descricao":"Pele íntegra","estado":"PRESENTE",
                         "lado":"ESQUERDO","regiao":"Joelho","metodo":"Inspeção"}]}
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private String profissionalA;
    private String profissionalB;
    private String pacienteDeA;

    @BeforeEach
    void setUp() throws Exception {
        when(jwtDecoder.decode(anyString())).thenAnswer(i -> Jwt.withTokenValue(i.getArgument(0))
                .header("alg", "ES256").subject(i.getArgument(0)).claim("aal", "aal2")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build());
        profissionalA = cadastrarProfissional();
        profissionalB = cadastrarProfissional();
        var resposta = mvc.perform(post("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"nome":"Maria","sobrenome":"Silva","identificador":"A-1",
                         "dataNascimento":"1980-05-10"}
                        """)).andExpect(status().isCreated()).andReturn();
        pacienteDeA = JsonPath.read(resposta.getResponse().getContentAsString(), "$.id");
    }

    @Test
    void deveRegistrarAvaliacaoComTodosOsBlocos() throws Exception {
        criar(profissionalA, pacienteDeA, COMPLETA)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dorEscala").value(6))
                .andExpect(jsonPath("$.triagem.GESTACAO").value("AUSENTE"))
                .andExpect(jsonPath("$.achados[0].lado").value("ESQUERDO"))
                .andExpect(jsonPath("$.achados[0].metodo").value("Inspeção"))
                .andExpect(jsonPath("$.criadoPor").value(profissionalA));
    }

    @Test
    void deveGravarItemDeTriagemOmitidoComoNaoAvaliadoNuncaComoAusente() throws Exception {
        criar(profissionalA, pacienteDeA, COMPLETA)
                .andExpect(jsonPath("$.triagem.SUSPEITA_TROMBOSE").value("NAO_AVALIADO"))
                .andExpect(jsonPath("$.triagem.INFECCAO").value("NAO_AVALIADO"))
                .andExpect(jsonPath("$.triagem.ALTERACAO_PELE_SENSIBILIDADE").value("NAO_AVALIADO"))
                .andExpect(jsonPath("$.triagem.RESTRICOES").value("NAO_AVALIADO"));
    }

    @Test
    void deveGravarAchadoSemEstadoComoNaoAvaliado() throws Exception {
        criar(profissionalA, pacienteDeA, """
                {"queixa":"Dor no joelho","objetivo":"Comparar a dor","dataAvaliacao":"2026-10-10","achados":[{"bloco":"FUNCAO_MOTORA","descricao":"Força de quadríceps",
                  "lado":"DIREITO","regiao":"Coxa","metodo":"Teste manual"}]}
                """).andExpect(status().isCreated())
                .andExpect(jsonPath("$.achados[0].estado").value("NAO_AVALIADO"));
    }

    @Test
    void deveDeixarDorNaoInformadaNulaENuncaZero() throws Exception {
        criar(profissionalA, pacienteDeA, "{\"queixa\":\"Dor\",\"objetivo\":\"Comparar\",\"dataAvaliacao\":\"2026-10-10\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dorEscala").value(nullValue()));
    }

    @Test
    void deveExigirLadoRegiaoEMetodoEmCadaAchado() throws Exception {
        criar(profissionalA, pacienteDeA, """
                {"queixa":"Dor no joelho","objetivo":"Comparar a dor","dataAvaliacao":"2026-10-10","achados":[{"bloco":"FUNCAO_MOTORA","descricao":"Força"}]}
                """).andExpect(status().isBadRequest());
    }

    @Test
    void deveExigirQueixaEObjetivo() throws Exception {
        criar(profissionalA, pacienteDeA, "{\"dataAvaliacao\":\"2026-10-10\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.queixa").exists())
                .andExpect(jsonPath("$.erros.objetivo").exists());
    }

    @Test
    void deveExigirTarefaEMomentoQuandoADorFoiInformada() throws Exception {
        criar(profissionalA, pacienteDeA, COMPLETA.replace("\"dorTarefa\":\"Subir 10 degraus\",", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.dorComTarefaEMomento").exists());
    }

    @Test
    void deveRecusarDataAntesDoNascimentoDoPaciente() throws Exception {
        criar(profissionalA, pacienteDeA, COMPLETA.replace("2026-10-10", "1979-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.dataAvaliacao").value("A avaliação não pode ser antes do nascimento do paciente."));
    }

    @Test
    void deveRecusarDataAntesDe1900() throws Exception {
        criar(profissionalA, pacienteDeA, COMPLETA.replace("2026-10-10", "1850-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRecusarDorForaDeZeroADez() throws Exception {
        criar(profissionalA, pacienteDeA, "{\"queixa\":\"Dor\",\"objetivo\":\"Comparar\",\"dataAvaliacao\":\"2026-10-10\",\"dorEscala\":11}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.dorEscala").exists());
    }

    @Test
    void deveListarVariasAvaliacoesDaMaisRecenteParaAMaisAntiga() throws Exception {
        criar(profissionalA, pacienteDeA, "{\"queixa\":\"Dor\",\"objetivo\":\"Comparar\",\"dataAvaliacao\":\"2026-09-01\"}");
        criar(profissionalA, pacienteDeA, "{\"queixa\":\"Dor\",\"objetivo\":\"Comparar\",\"dataAvaliacao\":\"2026-10-01\"}");

        listar(profissionalA, pacienteDeA, "")
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].dataAvaliacao").value("2026-10-01"));
        listar(profissionalA, pacienteDeA, "direcao=asc")
                .andExpect(jsonPath("$[0].dataAvaliacao").value("2026-09-01"));
    }

    @Test
    void deveResponder404AOutroProfissionalAoCriarListarVerOuAlterar() throws Exception {
        var id = idDe(criar(profissionalA, pacienteDeA, COMPLETA));

        criar(profissionalB, pacienteDeA, COMPLETA).andExpect(status().isNotFound());
        listar(profissionalB, pacienteDeA, "").andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/pacientes/" + pacienteDeA + "/avaliacoes/" + id)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalB)).andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/pacientes/" + pacienteDeA + "/avaliacoes/" + id)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalB)
                .contentType(MediaType.APPLICATION_JSON).content(COMPLETA)).andExpect(status().isNotFound());
    }

    @Test
    void deveAlterarAAvaliacaoERegistrarQuemAlterou() throws Exception {
        var id = idDe(criar(profissionalA, pacienteDeA, COMPLETA));

        mvc.perform(put("/api/v1/pacientes/" + pacienteDeA + "/avaliacoes/" + id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA)
                        .contentType(MediaType.APPLICATION_JSON).content(COMPLETA.replace("\"dorEscala\":6", "\"dorEscala\":4")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dorEscala").value(4))
                .andExpect(jsonPath("$.achados", hasSize(1)))
                .andExpect(jsonPath("$.alteradoPor").value(profissionalA));
    }

    private String cadastrarProfissional() throws Exception {
        var sub = UUID.randomUUID().toString();
        mvc.perform(post("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + sub)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"aceiteTermos":true,"nome":"Bia Lima","perfil":"PROFISSIONAL","categoria":"FISIOTERAPEUTA","registro":"123456-F","uf":"MG"}
                        """)).andExpect(status().isCreated());
        return sub;
    }

    private ResultActions criar(String sub, String paciente, String corpo) throws Exception {
        return mvc.perform(post("/api/v1/pacientes/" + paciente + "/avaliacoes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + sub)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions listar(String sub, String paciente, String query) throws Exception {
        return mvc.perform(get("/api/v1/pacientes/" + paciente + "/avaliacoes?" + query)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + sub));
    }

    private static String idDe(ResultActions r) throws Exception {
        return JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.id");
    }
}
