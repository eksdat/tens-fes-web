package br.unibh.fisiotech.conteudo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
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
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

import br.unibh.fisiotech.TestcontainersConfiguration;

/**
 * Revisão com PostgreSQL real: migration V13, segurança (REVISOR + aal2) e a página técnica liberada depois da
 * aprovação. O token simulado é "sub" ou "sub~aal1"; sem sufixo, a sessão é aal2. Cada teste é desfeito no final.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class RevisaoConteudoIntegracaoTest {

    private static final ZoneId BRASILIA = ZoneId.of("America/Sao_Paulo");

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager em;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private Clock relogio;

    private UUID wendy;

    @BeforeEach
    void setUp() {
        when(jwtDecoder.decode(anyString())).thenAnswer(i -> {
            String[] partes = i.<String>getArgument(0).split("~");
            return Jwt.withTokenValue(i.getArgument(0)).header("alg", "ES256").subject(partes[0])
                    .claim("aal", partes.length > 1 ? partes[1] : "aal2")
                    .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        });
        when(relogio.instant()).thenReturn(Instant.parse("2026-11-11T15:00:00Z"));
        when(relogio.getZone()).thenReturn(BRASILIA);
        wendy = profissional("Wendy Darling", true);
    }

    @Test
    void deveListarSoOQueEstaEmRevisao() throws Exception {
        conteudo("Caso em revisão", "EM_REVISAO", null);
        conteudo("Caso em rascunho", "RASCUNHO", null);

        mvc.perform(get("/api/v1/revisao/conteudos").header(HttpHeaders.AUTHORIZATION, "Bearer " + wendy))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].titulo", hasItem("Caso em revisão")))
                .andExpect(jsonPath("$[*].titulo", not(hasItem("Caso em rascunho"))))
                .andExpect(jsonPath("$[*].estado", not(hasItem("RASCUNHO"))));
    }

    @Test
    void deveAprovarGravandoRevisorEDataNoBanco() throws Exception {
        var id = conteudo("Caso para aprovar", "EM_REVISAO", null);

        aprovar(wendy, id)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROVADO"))
                .andExpect(jsonPath("$.dataRevisao").value("2026-11-11"));

        var linha = linha(id);
        assertThat(linha.get("estado")).isEqualTo("APROVADO");
        assertThat(linha.get("revisor_id")).isEqualTo(wendy);
        assertThat(linha.get("data_revisao")).hasToString("2026-11-11");
    }

    @Test
    void deveDevolverParaRascunhoETirarDaFila() throws Exception {
        var id = conteudo("Caso para devolver", "EM_REVISAO", null);

        mvc.perform(post("/api/v1/revisao/conteudos/" + id + "/devolver")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + wendy)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Exemplo sem fonte.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RASCUNHO"));

        var linha = linha(id);
        assertThat(linha.get("estado")).isEqualTo("RASCUNHO");
        assertThat(linha.get("motivo_devolucao")).isEqualTo("Exemplo sem fonte.");
        mvc.perform(get("/api/v1/revisao/conteudos").header(HttpHeaders.AUTHORIZATION, "Bearer " + wendy))
                .andExpect(jsonPath("$[*].titulo", not(hasItem("Caso para devolver"))));
    }

    @Test
    void deveLiberarAPaginaTecnicaQuandoOsCincoBlocosSaoAprovados() throws Exception {
        var estudante = estudante();
        var blocos = jdbc.queryForList("""
                select id from conteudo
                where modalidade = 'TENS' and secao = 'VISAO_GERAL' and bloco is not null""", Long.class);
        assertThat(blocos).hasSize(5);
        pagina(estudante).andExpect(jsonPath("$.liberada").value(false));

        aprovarTodos(blocos);

        pagina(estudante)
                .andExpect(jsonPath("$.liberada").value(true))
                .andExpect(jsonPath("$.blocos", hasSize(5)))
                .andExpect(jsonPath("$.dataRevisao").value("2026-11-11"));
    }

    @Test
    void deveImpedirQueOAutorAproveOProprioConteudo() throws Exception {
        var id = conteudo("Caso escrito pela Wendy", "EM_REVISAO", wendy);

        aprovar(wendy, id)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Quem escreveu o conteúdo não pode revisá-lo."));

        assertThat(linha(id).get("estado")).isEqualTo("EM_REVISAO");
    }

    @Test
    void deveResponder409AoAprovarDuasVezes() throws Exception {
        var id = conteudo("Caso aprovado duas vezes", "EM_REVISAO", null);
        aprovar(wendy, id).andExpect(status().isOk());

        aprovar(wendy, id)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Este conteúdo não está mais em revisão."));
    }

    @Test
    void deveNegarProfissionalQueNaoERevisor() throws Exception {
        var id = conteudo("Caso protegido", "EM_REVISAO", null);
        var gancho = profissional("Capitão Gancho", false);

        aprovar(gancho, id).andExpect(status().isForbidden());

        assertThat(linha(id).get("estado")).isEqualTo("EM_REVISAO");
    }

    @Test
    void deveExigirVerificacaoEmDuasEtapas() throws Exception {
        mvc.perform(get("/api/v1/revisao/conteudos").header(HttpHeaders.AUTHORIZATION, "Bearer " + wendy + "~aal1"))
                .andExpect(status().isForbidden());
    }

    private ResultActions aprovar(UUID revisor, Long id) throws Exception {
        return mvc.perform(post("/api/v1/revisao/conteudos/" + id + "/aprovar")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + revisor));
    }

    private void aprovarTodos(List<Long> ids) throws Exception {
        for (var id : ids) {
            aprovar(wendy, id).andExpect(status().isOk());
        }
    }

    private ResultActions pagina(UUID usuario) throws Exception {
        return mvc.perform(get("/api/v1/conteudos/pagina").param("modalidade", "TENS").param("secao", "VISAO_GERAL")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + usuario));
    }

    private UUID profissional(String nome, boolean revisor) {
        var id = UUID.randomUUID();
        jdbc.update("""
                insert into usuario (id, nome, perfil, revisor, categoria, registro, uf)
                values (?, ?, 'PROFISSIONAL', ?, 'FISIOTERAPEUTA', '123456-F', 'MG')""", id, nome, revisor);
        return id;
    }

    private UUID estudante() {
        var id = UUID.randomUUID();
        jdbc.update("""
                insert into usuario (id, nome, perfil, instituicao, periodo)
                values (?, 'Peter Pan', 'ESTUDANTE', 'UniBH', 3)""", id);
        return id;
    }

    /** Conteúdo próprio do teste (NMES, aba Casos, sem bloco), para não mexer nos textos do guia. */
    private Long conteudo(String titulo, String estado, UUID autor) {
        return jdbc.queryForObject("""
                insert into conteudo (titulo, modalidade, secao, corpo, referencias, estado, autor_id)
                values (?, 'NMES', 'CASOS', 'Texto de teste.', '[R3]', ?, ?)
                returning id""", Long.class, titulo, estado, autor);
    }

    /** O que está gravado de fato: descarrega o JPA antes de ler pelo JDBC. */
    private Map<String, Object> linha(Long id) {
        em.flush();
        List<Map<String, Object>> linhas = jdbc.queryForList(
                "select estado, revisor_id, data_revisao, motivo_devolucao from conteudo where id = ?", id);
        return linhas.getFirst();
    }
}
