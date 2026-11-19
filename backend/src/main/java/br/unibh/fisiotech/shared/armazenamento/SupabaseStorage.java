package br.unibh.fisiotech.shared.armazenamento;

import java.time.Duration;
import java.util.Map;
import java.util.function.Supplier;

import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import lombok.extern.slf4j.Slf4j;

import br.unibh.fisiotech.shared.exception.ArmazenamentoIndisponivelException;

/**
 * Bucket privado do Supabase Storage pela API REST (/storage/v1). Usa a chave secreta do projeto, que só existe no
 * backend (SEGURANCA.md, seção 3). A chave nova ({@code sb_secret_...}) vai no cabeçalho {@code apikey}; a
 * {@code service_role} antiga é um JWT e vai também no {@code Authorization}.
 */
@Slf4j
public class SupabaseStorage implements ArmazenamentoArquivos {

    private static final String FALHOU = "Não foi possível acessar os anexos agora. Tente de novo em instantes.";

    private final RestClient http;
    private final String urlStorage;
    private final String bucket;

    public SupabaseStorage(RestClient.Builder builder, String urlSupabase, String chave, String bucket) {
        this.urlStorage = urlSupabase + "/storage/v1";
        this.bucket = bucket;
        this.http = builder.baseUrl(urlStorage)
                .defaultHeaders(h -> {
                    h.set("apikey", chave);
                    if (chave.startsWith("eyJ")) {
                        h.setBearerAuth(chave);
                    }
                })
                .build();
    }

    @Override
    public void guardar(String caminho, byte[] conteudo, String tipo) {
        executar("guardar", () -> http.post().uri("/object/{bucket}/{caminho}", bucket, caminho)
                .contentType(MediaType.parseMediaType(tipo))
                .header("x-upsert", "false")
                .body(conteudo)
                .retrieve()
                .toBodilessEntity());
    }

    @Override
    public void apagar(String caminho) {
        executar("apagar", () -> http.delete().uri("/object/{bucket}/{caminho}", bucket, caminho)
                .retrieve()
                .toBodilessEntity());
    }

    @Override
    public String linkTemporario(String caminho, Duration validade) {
        var resposta = executar("assinar", () -> http.post().uri("/object/sign/{bucket}/{caminho}", bucket, caminho)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("expiresIn", validade.toSeconds()))
                .retrieve()
                .body(LinkAssinado.class));
        if (resposta == null || resposta.signedURL() == null) {
            throw new ArmazenamentoIndisponivelException(FALHOU);
        }
        return urlStorage + resposta.signedURL();
    }

    /** O erro do Storage vai para o log (sem a chave); a pessoa recebe 503 com texto fixo. */
    private <T> T executar(String acao, Supplier<T> chamada) {
        try {
            return chamada.get();
        } catch (RestClientException e) {
            log.warn("Supabase Storage falhou ao {}: {}", acao, e.getMessage());
            throw new ArmazenamentoIndisponivelException(FALHOU);
        }
    }

    /** Resposta de POST /object/sign: o caminho assinado, relativo a /storage/v1. */
    record LinkAssinado(String signedURL) {
    }
}
