package br.unibh.fisiotech.config;

import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/** Preenche {@code criado_por} e {@code alterado_por} com o {@code sub} do token (o id do usuário). */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "usuarioDoToken")
public class AuditoriaConfig {

    @Bean
    AuditorAware<UUID> usuarioDoToken() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(JwtAuthenticationToken.class::isInstance)
                .map(a -> UUID.fromString(((JwtAuthenticationToken) a).getToken().getSubject()));
    }
}
