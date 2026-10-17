package br.unibh.fisiotech.sessao;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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

/** Registro de sessão (guia, seções 16 e 18) com PostgreSQL real. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class SessaoIntegracaoTest {

    private static final String SESSAO = """
            {"dataHora":"2026-10-10T14:00:00Z","objetivo":"Reduzir dor na tarefa de subir escada.",
             "modalidade":"TENS","aparelho":"Neurodyn Portable","modo":"Convencional","duracaoRealMin":20,
             "canais":[{"canal":1,"frequenciaHz":80,"larguraPulsoUs":100,"amplitudeInicialMa":0,"amplitudeFinalMa":18,"par":"1A-1B"}],
             "eletrodoTipo":"Borracha condutiva","eletrodoDimensoes":"5 cm × 5 cm","lado":"ESQUERDO",
             "marcos":"Patela; acima medial e abaixo lateral","montagemId":"joelho",
             "sensacao":"Formigamento forte e confortável","contracao":null,"tolerancia":"Boa","fadiga":null,"ajustes":"Nenhum",
             "medidaAntes":"Dor 6/10 na tarefa","medidaDepois":"Dor 4/10 na tarefa","medidaContexto":"Mesma tarefa",
             "condicaoPele":"Sem alteração","motivoTermino":"Tempo programado","planoReavaliacao":"Reavaliar a mesma tarefa.",
             "checklist":["antes.objetivo-definido","durante.observar-pele"]}
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
        var r = mvc.perform(post("/api/v1/pacientes").header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"nome":"Maria","sobrenome":"Silva","identificador":"A-1",
                         "dataNascimento":"1980-05-10"}
                        """)).andExpect(status().isCreated()).andReturn();
        pacienteDeA = JsonPath.read(r.getResponse().getContentAsString(), "$.id");
    }

    @Test
    void deveRegistrarSessaoComParametrosPorCanalEUnidades() throws Exception {
        criar(profissionalA, pacienteDeA, SESSAO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profissionalId").value(profissionalA))
                .andExpect(jsonPath("$.canais[0].frequenciaHz").value(80))
                .andExpect(jsonPath("$.canais[0].larguraPulsoUs").value(100))
                .andExpect(jsonPath("$.canais[0].amplitudeFinalMa").value(18))
                .andExpect(jsonPath("$.duracaoRealMin").value(20))
                .andExpect(jsonPath("$.montagemId").value("joelho"))
                .andExpect(jsonPath("$.checklist", hasSize(2)));
    }

    @Test
    void deveResponder404AOutroProfissionalAoRegistrarOuVerSessoes() throws Exception {
        var id = idDe(criar(profissionalA, pacienteDeA, SESSAO));

        criar(profissionalB, pacienteDeA, SESSAO).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/pacientes/" + pacienteDeA + "/sessoes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalB)).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/pacientes/" + pacienteDeA + "/sessoes/" + id)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalB)).andExpect(status().isNotFound());
    }

    @Test
    void deveListarDaMaisRecenteParaAMaisAntiga() throws Exception {
        criar(profissionalA, pacienteDeA, SESSAO.replace("2026-10-10T14:00:00Z", "2026-09-01T14:00:00Z"));
        criar(profissionalA, pacienteDeA, SESSAO);

        mvc.perform(get("/api/v1/pacientes/" + pacienteDeA + "/sessoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + profissionalA))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].dataHora").value("2026-10-10T14:00:00Z"));
    }

    @Test
    void deveExigirOsBlocosObrigatorios() throws Exception {
        criar(profissionalA, pacienteDeA, "{\"modalidade\":\"TENS\",\"canais\":[]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.objetivo").exists())
                .andExpect(jsonPath("$.erros.duracaoRealMin").exists())
                .andExpect(jsonPath("$.erros.canais").exists())
                .andExpect(jsonPath("$.erros.condicaoPele").exists())
                .andExpect(jsonPath("$.erros.planoReavaliacao").exists());
    }

    @Test
    void deveGuardarOChecklistPorCodigoFixoERecusarTextoLivre() throws Exception {
        criar(profissionalA, pacienteDeA, SESSAO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.checklist", hasItem("antes.objetivo-definido")));
        criar(profissionalA, pacienteDeA, SESSAO.replace("antes.objetivo-definido", "Antes:Objetivo definido?"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRecusarCanalRepetido() throws Exception {
        var dois = SESSAO.replace("\"par\":\"1A-1B\"}]", "\"par\":\"1A-1B\"},"
                + "{\"canal\":1,\"frequenciaHz\":80,\"larguraPulsoUs\":100,\"amplitudeFinalMa\":10,\"par\":\"2A-2B\"}]");

        criar(profissionalA, pacienteDeA, dois).andExpect(status().isBadRequest());
    }

    @Test
    void deveRecusarParametroForaDoLimiteFisico() throws Exception {
        criar(profissionalA, pacienteDeA, SESSAO.replace("\"amplitudeFinalMa\":18", "\"amplitudeFinalMa\":500"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRecusarSessaoAntesDoNascimentoDoPaciente() throws Exception {
        criar(profissionalA, pacienteDeA, SESSAO.replace("2026-10-10T14:00:00Z", "1979-01-01T14:00:00Z"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.dataHora").value("A sessão não pode ser antes do nascimento do paciente."));
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "\"frequenciaHz\":80|\"frequenciaHz\":2.55",
            "\"amplitudeFinalMa\":18|\"amplitudeFinalMa\":0.04",
            "\"amplitudeInicialMa\":0|\"amplitudeInicialMa\":1.25",
            "\"duracaoRealMin\":20|\"duracaoRealMin\":0.04",
            "\"larguraPulsoUs\":100|\"larguraPulsoUs\":100.5"})
    void deveRecusarMaisCasasDecimaisDoQueOBancoGuarda(String original, String comMaisCasas) throws Exception {
        criar(profissionalA, pacienteDeA, SESSAO.replace(original, comMaisCasas))
                .andExpect(status().isBadRequest());
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
        return mvc.perform(post("/api/v1/pacientes/" + paciente + "/sessoes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + sub)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private static String idDe(ResultActions r) throws Exception {
        return JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.id");
    }
}
