package br.unibh.fisiotech.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Relógio no fuso de Brasília. Quem precisa da data de hoje recebe este bean, e o teste fixa o dia. */
@Configuration
public class RelogioConfig {

    @Bean
    Clock relogio() {
        return Clock.system(ZoneId.of("America/Sao_Paulo"));
    }
}
