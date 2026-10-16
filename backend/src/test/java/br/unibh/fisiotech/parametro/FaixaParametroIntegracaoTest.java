package br.unibh.fisiotech.parametro;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import br.unibh.fisiotech.TestcontainersConfiguration;

import static org.assertj.core.api.Assertions.assertThat;

/** Flyway carrega as faixas do guia (educativas) e do manual do Neurodyn (aparelho). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class FaixaParametroIntegracaoTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveListarSoAsFaixasDaModalidade() throws Exception {
        mvc.perform(get("/api/v1/parametros/faixas").param("modalidade", "TENS").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].modalidade", everyItem(is("TENS"))))
                .andExpect(jsonPath("$[?(@.modo == 'Convencional' && @.origem == 'EDUCATIVA' && @.parametro == 'Frequência')].maximo",
                        hasItem(100.0)))
                .andExpect(jsonPath("$[?(@.modo == 'Convencional' && @.origem == 'APARELHO' && @.parametro == 'Largura de pulso')].maximo",
                        hasItem(150.0)));
    }

    @Test
    void deveTrazerAsRampasDoFesPeloManual() throws Exception {
        mvc.perform(get("/api/v1/parametros/faixas").param("modalidade", "FES").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.parametro == 'Rampa de subida')].maximo", hasItem(20.0)))
                .andExpect(jsonPath("$[?(@.parametro == 'Platô')].unidade", hasItem("s")));
    }

    @Test
    void deveRecusarModalidadeInvalida() throws Exception {
        mvc.perform(get("/api/v1/parametros/faixas").param("modalidade", "XYZ").with(estudante()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveTerMinimoMenorOuIgualAoMaximoEmTodaFaixa() {
        Integer invalidas = jdbc.queryForObject("select count(*) from faixa_parametro where minimo > maximo", Integer.class);
        Integer total = jdbc.queryForObject("select count(*) from faixa_parametro", Integer.class);
        assertThat(invalidas).isZero();
        assertThat(total).isGreaterThan(10);
    }

    private static RequestPostProcessor estudante() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ESTUDANTE"));
    }
}
