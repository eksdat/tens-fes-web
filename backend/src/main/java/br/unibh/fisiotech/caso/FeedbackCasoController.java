package br.unibh.fisiotech.caso;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.service.ConteudoService;
import br.unibh.fisiotech.parametro.service.FaixaParametroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;

@RestController
@RequiredArgsConstructor
public class FeedbackCasoController {
    private final CasoClinicoController casos;
    private final ConteudoService conteudo;
    private final FaixaParametroService faixas;
    private final AvaliacaoCasoIa ia;
    private final JdbcClient banco;
    private final JsonMapper json = JsonMapper.builder().build();

    @GetMapping("/api/v1/casos-clinicos/{id}/feedback-ia")
    public AvaliacaoCasoIa.Feedback ler(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        var caso = casos.buscar(jwt, id).caso();
        var assinatura = assinatura(caso, base(caso.modalidade()));
        return buscar(id).filter(registro -> assinatura.equals(registro.assinatura()))
                .map(registro -> converter(registro.feedback())).orElse(null);
    }

    @PostMapping("/api/v1/casos-clinicos/{id}/feedback-ia")
    public AvaliacaoCasoIa.Feedback avaliar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        var caso = casos.buscar(jwt, id).caso();
        var base = base(caso.modalidade());
        var assinatura = assinatura(caso, base);
        var anterior = buscar(id).filter(registro -> assinatura.equals(registro.assinatura()));
        if (anterior.isPresent()) return converter(anterior.get().feedback());
        ia.reservar(UUID.fromString(jwt.getSubject()));
        var feedback = ia.avaliar(caso, base.trechos(), base.referencias(), caso.modalidade(), base.catalogo());
        var resultado = json.writeValueAsString(feedback);
        if (resultado.getBytes(StandardCharsets.UTF_8).length > 3800) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "Avaliação educativa indisponível.");
        }
        banco.sql("""
                insert into caso_clinico_feedback_ia (caso_id, assinatura, feedback) values (?, ?, cast(? as jsonb))
                on conflict (caso_id) do update set assinatura = excluded.assinatura,
                    feedback = excluded.feedback, gerado_em = now()
                """).params(id, assinatura, resultado).update();
        return feedback;
    }

    @PostMapping("/api/v1/simulacoes/ia/feedback")
    public AvaliacaoCasoIa.Feedback avaliarRascunho(@AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid AvaliacaoCasoIa.Rascunho rascunho) {
        ia.reservar(UUID.fromString(jwt.getSubject()));
        var base = base(rascunho.modalidade());
        return ia.avaliar(rascunho, base.trechos(), base.referencias(), rascunho.modalidade(), base.catalogo());
    }

    private record Base(List<String> trechos, List<String> referencias,
                        Map<String, Map<String, AjustesSimuladorIa.Faixa>> catalogo) {}
    private record Registro(String assinatura, String feedback) {}

    private Base base(String modalidade) {
        if ("NMES".equals(modalidade)) return new Base(List.of(), List.of(), Map.of());
        var tipo = Modalidade.valueOf(modalidade);
        var catalogo = AjustesSimuladorIa.catalogo(tipo, faixas.listar(tipo));
        var pagina = conteudo.paginaTecnica(tipo, Secao.CASOS);
        if (!pagina.liberada()) return new Base(List.of(), List.of(), catalogo);
        return new Base(pagina.blocos().stream().limit(6).map(bloco -> cortar(bloco.corpo(), 1500)).toList(),
                pagina.referencias().stream().limit(3).map(referencia -> cortar(referencia, 180)).toList(), catalogo);
    }

    private static String cortar(String valor, int limite) {
        return valor.substring(0, Math.min(valor.length(), limite));
    }

    private java.util.Optional<Registro> buscar(UUID id) {
        return banco.sql("select assinatura, feedback::text as feedback from caso_clinico_feedback_ia where caso_id = ?")
                .param(id).query(Registro.class).optional();
    }

    private AvaliacaoCasoIa.Feedback converter(String feedback) {
        return json.readValue(feedback, AvaliacaoCasoIa.Feedback.class);
    }

    private String assinatura(CasoClinicoController.Envio caso, Base base) {
        var entrada = json.writeValueAsString(List.of(AvaliacaoCasoIa.VERSAO, caso, base));
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(entrada.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException falha) {
            throw new IllegalStateException(falha);
        }
    }
}
