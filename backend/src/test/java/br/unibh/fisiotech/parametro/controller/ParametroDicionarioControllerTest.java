package br.unibh.fisiotech.parametro.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import br.unibh.fisiotech.config.SecurityConfig;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.dto.FaixaParametroResponse;
import br.unibh.fisiotech.parametro.dto.ParametroDicionarioResponse;
import br.unibh.fisiotech.parametro.enums.GrupoParametro;
import br.unibh.fisiotech.parametro.enums.OrigemFaixa;
import br.unibh.fisiotech.parametro.service.FaixaParametroService;
import br.unibh.fisiotech.parametro.service.ParametroDicionarioService;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;
import br.unibh.fisiotech.usuario.security.PerfilJwtConverter;

@WebMvcTest(ParametroDicionarioController.class)
@Import({ SecurityConfig.class, PerfilJwtConverter.class })
class ParametroDicionarioControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ParametroDicionarioService service;

    @MockitoBean
    private FaixaParametroService faixas;

    @MockitoBean
    private UsuarioRepository repository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveResponder401SemToken() throws Exception {
        mvc.perform(get("/api/v1/parametros")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveResponder403SemPerfil() throws Exception {
        mvc.perform(get("/api/v1/parametros").with(jwt())).andExpect(status().isForbidden());
    }

    @Test
    void deveListarComOsCamposDoUml() throws Exception {
        when(service.listar(null)).thenReturn(List.of(new ParametroDicionarioResponse(1L, "Largura de pulso",
                GrupoParametro.AJUSTE_BASICO, "us", "microssegundos", "Tempo de uma fase", "300 us = 0,3 ms")));

        mvc.perform(get("/api/v1/parametros").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].grupo").value("AJUSTE_BASICO"))
                .andExpect(jsonPath("$[0].unidadeExtenso").value("microssegundos"))
                .andExpect(jsonPath("$[0].oQueMuda").value("Tempo de uma fase"));
    }

    @Test
    void devePassarABuscaParaOService() throws Exception {
        when(service.listar("pulso")).thenReturn(List.of());

        mvc.perform(get("/api/v1/parametros").param("busca", "pulso").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void deveRecusarBuscaMaiorQueOLimite() throws Exception {
        mvc.perform(get("/api/v1/parametros").param("busca", "a".repeat(101)).with(estudante()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveListarAsFaixasDaModalidade() throws Exception {
        when(faixas.listar(Modalidade.FES)).thenReturn(List.of(new FaixaParametroResponse(Modalidade.FES, "FES",
                "Frequência", "Hz", "hertz", OrigemFaixa.APARELHO, new BigDecimal("0.5"), new BigDecimal("250"), "M1")));

        mvc.perform(get("/api/v1/parametros/faixas").param("modalidade", "FES").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].origem").value("APARELHO"))
                .andExpect(jsonPath("$[0].minimo").value(0.5));
    }

    @Test
    void deveExigirAModalidadeNasFaixas() throws Exception {
        mvc.perform(get("/api/v1/parametros/faixas").with(estudante())).andExpect(status().isBadRequest());
    }

    private static RequestPostProcessor estudante() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ESTUDANTE"));
    }
}
