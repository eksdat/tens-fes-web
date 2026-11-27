package br.unibh.fisiotech.caso;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

class AvaliacaoCasoIaTest {
    @Test
    void deveRecusarFeedbackSemTodosOsCriterios() {
        var resposta = JsonMapper.builder().build().readTree("""
                {"estado":"avaliado","observacoes":{},"pergunta":"O que falta descrever?"}
                """);
        assertThatThrownBy(() -> AvaliacaoCasoIa.validar(resposta, List.of(), "simulado", "TENS", Map.of()))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void deveRecusarFrequenciaNoBurstEForaDaFaixa() {
        var catalogo = Map.of("Burst", Map.of("largura", faixa("µs", 50, 500)));
        var json = JsonMapper.builder().build();
        var resposta = json.readTree("""
                {"modo":"Burst","frequencia":null,"largura":200,"subida":null,"plato":null,"descida":null,"repouso":null}
                """);
        assertThat(AjustesSimuladorIa.validar("TENS", resposta, catalogo).valores())
                .containsEntry("largura", BigDecimal.valueOf(200));
        var comFrequencia = json.readTree(resposta.toString().replace("\"frequencia\":null", "\"frequencia\":250"));
        var larguraFora = json.readTree(resposta.toString().replace("\"largura\":200", "\"largura\":600"));
        assertThat(AjustesSimuladorIa.validar("TENS", comFrequencia, catalogo)).isNull();
        assertThat(AjustesSimuladorIa.validar("TENS", larguraFora, catalogo)).isNull();
    }

    @Test
    void deveLimitarPedidosPorUsuario() {
        var ia = new AvaliacaoCasoIa();
        var usuario = UUID.randomUUID();
        for (int i = 0; i < 5; i++) ia.reservar(usuario);
        assertThatThrownBy(() -> ia.reservar(usuario)).isInstanceOf(ResponseStatusException.class);
    }

    @EnabledIfEnvironmentVariable(named = "FISIOTECH_TESTAR_IA_REAL", matches = "1")
    @ParameterizedTest
    @ValueSource(strings = {"gemini", "groq"})
    void deveComentarExercicioFicticioComProvedorReal(String provedor) {
        var ia = new AvaliacaoCasoIa();
        ReflectionTestUtils.setField(ia, "gemini", "gemini".equals(provedor) ? System.getenv("GEMINI_API_KEY") : "");
        ReflectionTestUtils.setField(ia, "groq", "groq".equals(provedor) ? System.getenv("GROQ_API_KEY") : "");
        ReflectionTestUtils.setField(ia, "modeloGemini", System.getenv().getOrDefault("GEMINI_MODEL", "gemini-3.1-flash-lite"));
        ReflectionTestUtils.setField(ia, "modeloGroq", System.getenv().getOrDefault("GROQ_MODEL", "openai/gpt-oss-20b"));
        var feedback = ia.avaliar(new AvaliacaoCasoIa.Rascunho("TENS",
                "Exercício fictício de leitura do gráfico. Quero comparar pulsos regulares no modo Convencional. "
                + "Os números ainda estão em branco. Escolha valores ilustrativos apenas para desenhar o pulso."),
                List.of("Em um exercício de leitura do gráfico, identifique o parâmetro e a unidade antes de comparar pulsos."),
                List.of("Material fictício de teste"), "TENS", Map.of("Convencional", Map.of(
                        "frequencia", faixa("Hz", 60, 100), "largura", faixa("µs", 50, 150))));
        assertThat(feedback.observacoes()).containsKeys("objetivo", "cenario", "parametros", "montagem");
        assertThat(feedback.observacoes().get("parametros").estado()).isIn("revisar", "informacao_insuficiente");
        assertThat(feedback.simulacao()).isNotNull();
        assertThat(feedback.simulacao().modo()).isEqualTo("Convencional");
        assertThat(feedback.simulacao().valores()).containsOnlyKeys("frequencia", "largura");
        System.out.println(provedor + " · " + feedback.simulacao());
    }

    private static AjustesSimuladorIa.Faixa faixa(String unidade, int minimo, int maximo) {
        return new AjustesSimuladorIa.Faixa(unidade, BigDecimal.valueOf(minimo), BigDecimal.valueOf(maximo));
    }
}
