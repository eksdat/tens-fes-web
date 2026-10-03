package br.unibh.fisiotech.config;

import java.net.URI;

import org.flywaydb.core.Flyway;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Substitui o log padrão de inicialização (desligado em {@code spring.main.log-startup-info}) por um resumo:
 * onde a API responde, qual banco e em que versão do schema. Mostra só o host do banco, nunca usuário ou senha.
 */
@Slf4j
@Component
@RequiredArgsConstructor
class ResumoInicializacao {

    private final Environment env;
    private final Flyway flyway;

    @EventListener(ApplicationReadyEvent.class)
    void registrar() {
        var url = "http://localhost:" + env.getProperty("local.server.port");
        var versao = flyway.info().current();
        log.info("""
                Fisiotech API pronta
                  API ....... {}
                  Swagger ... {}/swagger-ui.html
                  Banco ..... {} (schema v{})
                  Auth ...... {}""",
                url, url, hostDoBanco(), versao == null ? "-" : versao.getVersion(),
                env.getProperty("spring.security.oauth2.resourceserver.jwt.issuer-uri"));
    }

    private String hostDoBanco() {
        var jdbc = env.getProperty("spring.datasource.url", "");
        return URI.create(jdbc.replaceFirst("^jdbc:", "")).getHost();
    }
}
