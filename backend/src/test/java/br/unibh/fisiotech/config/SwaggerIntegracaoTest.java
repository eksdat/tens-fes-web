package br.unibh.fisiotech.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.unibh.fisiotech.TestcontainersConfiguration;

/**
 * Com {@code SWAGGER_ENABLED} desligado (o padrão do {@code application.yml}, usado em produção) a documentação
 * da API não existe. O valor é fixado aqui para o teste não depender do {@code .env} de quem roda.
 */
@SpringBootTest(properties = "SWAGGER_ENABLED=false")
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class SwaggerIntegracaoTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveNaoExporOpenApiQuandoDesligado() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isNotFound());
    }

    @Test
    void deveNaoExporSwaggerUiQuandoDesligado() throws Exception {
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isNotFound());
    }
}
