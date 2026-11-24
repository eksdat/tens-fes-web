package br.unibh.fisiotech.shared.armazenamento;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import br.unibh.fisiotech.shared.exception.ArmazenamentoIndisponivelException;

/** Chamadas à API do Supabase Storage, sem rede: o servidor falso confere caminho, método e cabeçalhos. */
class SupabaseStorageTest {

    private static final String SUPABASE = "https://teste.supabase.co";
    private static final String OBJETO = SUPABASE + "/storage/v1/object/materiais/material-7-a.pdf";

    private MockRestServiceServer servidor;

    private SupabaseStorage storage(String chave) {
        var builder = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(builder).build();
        return new SupabaseStorage(builder, SUPABASE, chave, "materiais");
    }

    @Test
    void deveGuardarNoBucketComAChaveSecretaSoNoApikey() {
        var storage = storage("sb_secret_teste");
        servidor.expect(requestTo(OBJETO))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("apikey", "sb_secret_teste"))
                .andExpect(headerDoesNotExist(HttpHeaders.AUTHORIZATION))
                .andExpect(header(HttpHeaders.CONTENT_TYPE, "application/pdf"))
                .andExpect(header("x-upsert", "false"))
                .andRespond(withSuccess());

        storage.guardar("material-7-a.pdf", "%PDF-".getBytes(), "application/pdf");

        servidor.verify();
    }

    @Test
    void deveMandarAServiceRoleAntigaTambemNoAuthorization() {
        var storage = storage("eyJhbGciOiJIUzI1NiJ9.teste.assinatura");
        servidor.expect(requestTo(OBJETO))
                .andExpect(method(HttpMethod.DELETE))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer eyJhbGciOiJIUzI1NiJ9.teste.assinatura"))
                .andRespond(withSuccess());

        storage.apagar("material-7-a.pdf");

        servidor.verify();
    }

    @Test
    void deveMontarOLinkAssinadoComAValidadePedida() {
        var storage = storage("sb_secret_teste");
        servidor.expect(requestTo(SUPABASE + "/storage/v1/object/sign/materiais/material-7-a.pdf"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("{\"expiresIn\":300}"))
                .andRespond(withSuccess("{\"signedURL\":\"/object/sign/materiais/material-7-a.pdf?token=abc\"}",
                        MediaType.APPLICATION_JSON));

        var link = storage.linkTemporario("material-7-a.pdf", Duration.ofMinutes(5));

        assertThat(link).isEqualTo(SUPABASE + "/storage/v1/object/sign/materiais/material-7-a.pdf?token=abc");
    }

    @Test
    void deveResponder503SemRepassarOErroDoStorage() {
        var storage = storage("sb_secret_teste");
        servidor.expect(requestTo(OBJETO)).andRespond(withServerError().body("bucket materiais: erro interno"));

        assertThatThrownBy(() -> storage.guardar("material-7-a.pdf", "%PDF-".getBytes(), "application/pdf"))
                .isInstanceOfSatisfying(ArmazenamentoIndisponivelException.class, e -> assertThat(e.getBody().getDetail())
                        .isEqualTo("Não foi possível acessar os anexos agora. Tente de novo em instantes."));
    }
}
