package br.unibh.fisiotech.material;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import jakarta.persistence.EntityManager;

import br.unibh.fisiotech.TestcontainersConfiguration;
import br.unibh.fisiotech.shared.armazenamento.ArmazenamentoArquivos;
import br.unibh.fisiotech.shared.exception.ArmazenamentoIndisponivelException;

/**
 * Material de estudo com PostgreSQL real (migration V14). O Supabase Storage é simulado: o teste confere o que o
 * backend pede para guardar e apagar. Cada teste é desfeito no final.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class MaterialIntegracaoTest {

    private static final String MATERIAL = """
            {"titulo":"Resumo: TENS convencional","modalidade":"TENS","secao":"PARAMETROS",
             "corpo":"Frequência de 50 a 100 Hz; dor < 5 depois da aplicação no exemplo fictício.",
             "referencias":"[R1] Johnson, 2007"}
            """;

    private static final byte[] PDF = "%PDF-1.7\n1 0 obj\n<<>>\nendobj\n".getBytes();

    private static final String STORAGE_FORA = "Não foi possível acessar os anexos agora. Tente de novo em instantes.";

    private static final String LINK = "https://teste.supabase.co/storage/v1/object/sign/materiais/x.pdf?token=t";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager em;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private ArmazenamentoArquivos armazenamento;

    private UUID sininho;
    private UUID peterPan;

    @BeforeEach
    void setUp() {
        when(jwtDecoder.decode(anyString())).thenAnswer(i -> Jwt.withTokenValue(i.getArgument(0))
                .header("alg", "ES256").subject(i.getArgument(0)).claim("aal", "aal2")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build());
        sininho = estudante("Sininho");
        peterPan = estudante("Peter Pan");
    }

    @Test
    void deveCriarEmRascunhoComOAutorDoToken() throws Exception {
        var id = idDe(criar(sininho, MATERIAL)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("RASCUNHO"))
                .andExpect(jsonPath("$.secao").value("PARAMETROS"))
                .andExpect(jsonPath("$.anexos", hasSize(0))));

        em.flush();
        var linha = jdbc.queryForMap("select autor_id, bloco, estado from conteudo where id = ?", id);
        assertThat(linha.get("autor_id")).isEqualTo(sininho);
        assertThat(linha.get("bloco")).isNull();
    }

    @Test
    void deveMostrarORascunhoSoParaOAutor() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));

        pedir(get("/api/v1/materiais/" + id), peterPan).andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/materiais/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + peterPan)
                .contentType(MediaType.APPLICATION_JSON).content(MATERIAL)).andExpect(status().isNotFound());
        pedir(get("/api/v1/materiais"), peterPan).andExpect(jsonPath("$[*].id", not(hasItem(id.intValue()))));
        pedir(get("/api/v1/materiais"), sininho).andExpect(jsonPath("$[*].id", hasItem(id.intValue())));
        mvc.perform(get("/api/v1/conteudos/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + peterPan))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveRecusarHtmlMasAceitarOSinalDeMenor() throws Exception {
        criar(sininho, MATERIAL.replace("dor < 5", "<script>alert(1)</script>"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.corpo").value("Use texto simples ou Markdown, sem HTML."));
        criar(sininho, MATERIAL).andExpect(status().isCreated());
    }

    @Test
    void deveExigirTituloModalidadeTemaETexto() throws Exception {
        criar(sininho, "{\"titulo\":\" a\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.modalidade").value("Escolha a modalidade."))
                .andExpect(jsonPath("$.erros.secao").value("Escolha o tema."))
                .andExpect(jsonPath("$.erros.corpo").value("Escreva o texto do material."));
        criar(sininho, MATERIAL.replace("Resumo: TENS convencional", " a"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.titulo").value("Use de 2 a 200 caracteres."));
    }

    @Test
    void deveEnviarParaRevisaoEEntrarNaFilaDoRevisor() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        var wendy = revisora();

        pedir(post("/api/v1/materiais/" + id + "/enviar"), sininho)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EM_REVISAO"));

        mvc.perform(get("/api/v1/revisao/conteudos").header(HttpHeaders.AUTHORIZATION, "Bearer " + wendy))
                .andExpect(jsonPath("$[*].titulo", hasItem("Resumo: TENS convencional")));
    }

    @Test
    void naoDeveAlterarNemAnexarDepoisDeEnviado() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        pedir(post("/api/v1/materiais/" + id + "/enviar"), sininho).andExpect(status().isOk());

        mvc.perform(put("/api/v1/materiais/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + sininho)
                        .contentType(MediaType.APPLICATION_JSON).content(MATERIAL))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail")
                        .value("Este material já foi enviado para revisão e não pode ser alterado."));
        anexar(sininho, id, pdf("resumo.pdf"))
                .andExpect(status().isConflict());
        pedir(post("/api/v1/materiais/" + id + "/enviar"), sininho).andExpect(status().isConflict());
        pedir(delete("/api/v1/materiais/" + id), sininho).andExpect(status().isConflict());
    }

    @Test
    void deveVoltarParaRascunhoComOMotivoQuandoORevisorDevolve() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        pedir(post("/api/v1/materiais/" + id + "/enviar"), sininho).andExpect(status().isOk());

        mvc.perform(post("/api/v1/revisao/conteudos/" + id + "/devolver")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + revisora())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Cite a fonte da faixa.\"}"))
                .andExpect(status().isOk());

        pedir(get("/api/v1/materiais/" + id), sininho)
                .andExpect(jsonPath("$.estado").value("RASCUNHO"))
                .andExpect(jsonPath("$.motivoDevolucao").value("Cite a fonte da faixa."));
        mvc.perform(put("/api/v1/materiais/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + sininho)
                .contentType(MediaType.APPLICATION_JSON).content(MATERIAL)).andExpect(status().isOk());
    }

    @Test
    void deveAnexarPdfConferindoOTipoPelosBytes() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));

        anexar(sininho, id, pdf("C:\\fakepath\\resumo.pdf"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("resumo.pdf"))
                .andExpect(jsonPath("$.tipo").value("PDF"))
                .andExpect(jsonPath("$.tamanhoBytes").value(PDF.length))
                .andExpect(jsonPath("$.caminho").doesNotExist());

        verify(armazenamento).guardar(startsWith("material-" + id + "-"), eq(PDF),
                eq("application/pdf"));
        pedir(get("/api/v1/materiais/" + id), sininho).andExpect(jsonPath("$.anexos[0].nome").value("resumo.pdf"));
    }

    @Test
    void deveRecusarArquivoQueNaoEPdfNemImagemMesmoComExtensaoPdf() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));

        var executavel = new MockMultipartFile("arquivo", "virus.pdf", "application/pdf", "MZ\u0090\u0000".getBytes());

        anexar(sininho, id, executavel)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.arquivo").value("Envie um PDF ou uma imagem PNG ou JPEG."));

        verify(armazenamento, never()).guardar(any(), any(), any());
    }

    @Test
    void deveRecusarArquivoMaiorQue10MB() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        var grande = Arrays.copyOf(PDF, 10 * 1024 * 1024 + 1);

        anexar(sininho, id, new MockMultipartFile("arquivo", "grande.pdf", "application/pdf", grande))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.arquivo").value("O arquivo passa de 10 MB."));
    }

    @Test
    void deveAceitarAteCincoAnexosPorMaterial() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        anexarCinco(id);

        anexar(sininho, id, pdf("sexto.pdf"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Use até 5 anexos por material."));
    }

    @Test
    void deveResponder503QuandoOStorageFalha() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        doThrow(new ArmazenamentoIndisponivelException(STORAGE_FORA))
                .when(armazenamento).guardar(any(), any(), any());

        anexar(sininho, id, pdf("resumo.pdf"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.detail").value(STORAGE_FORA));
    }

    @Test
    void deveDarOLinkTemporarioSoParaOAutor() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        var anexo = idDoAnexo(anexar(sininho, id, pdf("resumo.pdf")));
        when(armazenamento.linkTemporario(any(), eq(Duration.ofMinutes(5))))
                .thenReturn(LINK);

        pedir(get("/api/v1/materiais/" + id + "/anexos/" + anexo + "/link"), sininho)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(LINK))
                .andExpect(jsonPath("$.expiraEm").exists());
        pedir(get("/api/v1/materiais/" + id + "/anexos/" + anexo + "/link"), peterPan).andExpect(status().isNotFound());
    }

    @Test
    void deveRemoverOAnexoDoBancoEDoStorage() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        var anexo = idDoAnexo(anexar(sininho, id, pdf("resumo.pdf")));

        pedir(delete("/api/v1/materiais/" + id + "/anexos/" + anexo), sininho).andExpect(status().isNoContent());

        verify(armazenamento).apagar(startsWith("material-" + id + "-"));
        pedir(get("/api/v1/materiais/" + id), sininho).andExpect(jsonPath("$.anexos", hasSize(0)));
    }

    @Test
    void deveExcluirORascunhoComOsArquivos() throws Exception {
        var id = idDe(criar(sininho, MATERIAL));
        anexar(sininho, id, pdf("resumo.pdf"));

        pedir(delete("/api/v1/materiais/" + id), sininho).andExpect(status().isNoContent());

        verify(armazenamento).apagar(startsWith("material-" + id + "-"));
        pedir(get("/api/v1/materiais/" + id), sininho).andExpect(status().isNotFound());
    }

    private ResultActions criar(UUID autor, String corpo) throws Exception {
        return mvc.perform(post("/api/v1/materiais").header(HttpHeaders.AUTHORIZATION, "Bearer " + autor)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions anexar(UUID autor, Long id, MockMultipartFile arquivo) throws Exception {
        return mvc.perform(multipart("/api/v1/materiais/" + id + "/anexos").file(arquivo)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + autor));
    }

    private static MockMultipartFile pdf(String nome) {
        return new MockMultipartFile("arquivo", nome, "application/pdf", PDF);
    }

    private void anexarCinco(Long id) throws Exception {
        for (var i = 1; i <= 5; i++) {
            anexar(sininho, id, pdf("parte" + i + ".pdf"))
                    .andExpect(status().isCreated());
        }
    }

    private ResultActions pedir(MockHttpServletRequestBuilder pedido, UUID usuario) throws Exception {
        return mvc.perform(pedido.header(HttpHeaders.AUTHORIZATION, "Bearer " + usuario));
    }

    private UUID estudante(String nome) {
        var id = UUID.randomUUID();
        jdbc.update("""
                insert into usuario (id, nome, perfil, instituicao, periodo)
                values (?, ?, 'ESTUDANTE', 'UniBH', 5)""", id, nome);
        return id;
    }

    private UUID revisora() {
        var id = UUID.randomUUID();
        jdbc.update("""
                insert into usuario (id, nome, perfil, revisor, categoria, registro, uf)
                values (?, 'Wendy Darling', 'PROFISSIONAL', true, 'FISIOTERAPEUTA', '123456-F', 'MG')""", id);
        return id;
    }

    private static Long idDe(ResultActions r) throws Exception {
        return ((Number) JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.id")).longValue();
    }

    private static String idDoAnexo(ResultActions r) throws Exception {
        return JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.id");
    }
}
