package br.unibh.fisiotech.conteudo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import br.unibh.fisiotech.TestcontainersConfiguration;

/**
 * Aprovar e devolver o mesmo texto ao mesmo tempo, com transações de verdade (o teste não é @Transactional). Uma
 * conexão segura a linha; as duas requisições ficam esperando; ao soltar, uma decide e a outra recebe 409. Sem o
 * {@code for update}, as duas respondiam 200 e a primeira decisão sumia (revisão do PR #38).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class RevisaoConcorrenteIntegracaoTest {

    private static final Duration ESPERA_MAXIMA = Duration.ofSeconds(10);

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private DataSource dataSource;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private UUID wendy;
    private UUID tiger;
    private Long id;

    @BeforeEach
    void setUp() {
        when(jwtDecoder.decode(anyString())).thenAnswer(i -> Jwt.withTokenValue(i.getArgument(0))
                .header("alg", "ES256").subject(i.getArgument(0)).claim("aal", "aal2")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build());
        wendy = revisor("Wendy Darling");
        tiger = revisor("Tiger Lily");
        id = jdbc.queryForObject("""
                insert into conteudo (titulo, modalidade, secao, corpo, referencias, estado)
                values ('Caso disputado', 'NMES', 'CASOS', 'Texto de teste.', '[R3]', 'EM_REVISAO')
                returning id""", Long.class);
    }

    /** Sem transação de teste para desfazer: apaga o que criou. */
    @AfterEach
    void limpar() {
        jdbc.update("delete from conteudo where id = ?", id);
        jdbc.update("delete from usuario where id in (?, ?)", wendy, tiger);
    }

    @Test
    void deveManterUmaSoDecisaoQuandoAprovarEDevolverChegamJuntos() throws Exception {
        var pedidos = Executors.newFixedThreadPool(2);
        try (var trava = dataSource.getConnection()) {
            trava.setAutoCommit(false);
            travarALinha(trava);

            var aprovacao = pedidos.submit(status(post("/api/v1/revisao/conteudos/" + id + "/aprovar"), wendy));
            var devolucao = pedidos.submit(status(post("/api/v1/revisao/conteudos/" + id + "/devolver")
                    .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Decisão simultânea.\"}"), tiger));
            esperarAsDuasNaFila(trava);
            trava.commit();

            var aprovou = aprovacao.get(ESPERA_MAXIMA.toSeconds(), TimeUnit.SECONDS);
            var devolveu = devolucao.get(ESPERA_MAXIMA.toSeconds(), TimeUnit.SECONDS);
            assertThat(List.of(aprovou, devolveu)).containsExactlyInAnyOrder(200, 409);

            // O que ficou gravado é a decisão de quem recebeu 200.
            var estado = jdbc.queryForObject("select estado from conteudo where id = ?", String.class, id);
            assertThat(Map.of("APROVADO", aprovou, "RASCUNHO", devolveu).get(estado)).isEqualTo(200);
        } finally {
            pedidos.shutdownNow();
        }
    }

    private Callable<Integer> status(MockHttpServletRequestBuilder pedido, UUID revisor) {
        return () -> mvc.perform(pedido.header(HttpHeaders.AUTHORIZATION, "Bearer " + revisor))
                .andReturn().getResponse().getStatus();
    }

    private void travarALinha(Connection trava) throws SQLException {
        try (var comando = trava.prepareStatement("select id from conteudo where id = ? for update")) {
            comando.setLong(1, id);
            comando.executeQuery().close();
        }
    }

    /** As duas requisições chegaram ao banco e estão paradas esperando a linha. */
    private void esperarAsDuasNaFila(Connection trava) throws SQLException, InterruptedException {
        var limite = Instant.now().plus(ESPERA_MAXIMA);
        while (esperandoLinha(trava) < 2) {
            assertThat(Instant.now()).as("as duas requisições deviam estar esperando a linha").isBefore(limite);
            Thread.sleep(50);
        }
    }

    /**
     * Pergunta pela própria conexão da trava: o pool tem 3 conexões e as três estão ocupadas (trava e as duas
     * requisições). Dentro de uma transação o PostgreSQL guarda o pg_stat_activity da primeira leitura; sem o
     * {@code pg_stat_clear_snapshot()} a contagem nunca muda e o teste estoura a espera.
     */
    private static int esperandoLinha(Connection trava) throws SQLException {
        try (var comando = trava.createStatement()) {
            comando.execute("select pg_stat_clear_snapshot()");
            try (var resultado = comando.executeQuery("""
                    select count(*) from pg_stat_activity
                    where datname = current_database() and wait_event_type = 'Lock'""")) {
                resultado.next();
                return resultado.getInt(1);
            }
        }
    }

    private UUID revisor(String nome) {
        var id = UUID.randomUUID();
        jdbc.update("""
                insert into usuario (id, nome, perfil, revisor, categoria, registro, uf)
                values (?, ?, 'PROFISSIONAL', true, 'FISIOTERAPEUTA', '123456-F', 'MG')""", id, nome);
        return id;
    }
}
