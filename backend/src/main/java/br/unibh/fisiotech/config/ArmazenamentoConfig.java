package br.unibh.fisiotech.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import lombok.extern.slf4j.Slf4j;

import br.unibh.fisiotech.shared.armazenamento.ArmazenamentoArquivos;
import br.unibh.fisiotech.shared.armazenamento.ArmazenamentoDesligado;
import br.unibh.fisiotech.shared.armazenamento.SupabaseStorage;

/** Anexos no Supabase Storage. Sem a chave secreta, a API sobe do mesmo jeito e só o anexo fica indisponível. */
@Configuration
@Slf4j
public class ArmazenamentoConfig {

    @Bean
    ArmazenamentoArquivos armazenamentoArquivos(@Value("${app.armazenamento.url}") String url,
            @Value("${app.armazenamento.chave:}") String chave, @Value("${app.armazenamento.bucket}") String bucket) {
        if (chave.isBlank()) {
            log.warn("SUPABASE_SECRET_KEY não definida: envio de anexos desligado.");
            return new ArmazenamentoDesligado();
        }
        return new SupabaseStorage(RestClient.builder(), url, chave, bucket);
    }
}
