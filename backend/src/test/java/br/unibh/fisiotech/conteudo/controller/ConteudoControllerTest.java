package br.unibh.fisiotech.conteudo.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
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

import br.unibh.fisiotech.conteudo.dto.ConteudoResponse;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.service.ConteudoService;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;
import br.unibh.fisiotech.usuario.security.PerfilJwtConverter;

@WebMvcTest(ConteudoController.class)
@Import({ SecurityConfig.class, PerfilJwtConverter.class })
class ConteudoControllerTest {

    private static final Long ID = 1L;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ConteudoService service;

    @MockitoBean
    private UsuarioRepository repository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveResponder401SemToken() throws Exception {
        mvc.perform(get("/api/v1/conteudos").param("modalidade", "TENS"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveResponder403SemPerfil() throws Exception {
        mvc.perform(get("/api/v1/conteudos").param("modalidade", "TENS").with(jwt()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveListarConteudosParaEstudante() throws Exception {
        when(service.listarAprovados(List.of(Modalidade.TENS)))
                .thenReturn(List.of(conteudo("Modos de TENS", Modalidade.TENS)));

        mvc.perform(get("/api/v1/conteudos").param("modalidade", "TENS").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("Modos de TENS"));
    }

    @Test
    void deveAceitarFesENmesJuntos() throws Exception {
        when(service.listarAprovados(List.of(Modalidade.FES, Modalidade.NMES)))
                .thenReturn(List.of(conteudo("FES", Modalidade.FES), conteudo("NMES", Modalidade.NMES)));

        mvc.perform(get("/api/v1/conteudos").param("modalidade", "FES", "NMES").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void deveResponder404QuandoConteudoNaoFoiAprovado() throws Exception {
        when(service.buscarAprovado(ID)).thenThrow(new RecursoNaoEncontradoException("Conteúdo não encontrado."));

        mvc.perform(get("/api/v1/conteudos/{id}", ID).with(estudante()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveResponder400ComModalidadeInvalida() throws Exception {
        mvc.perform(get("/api/v1/conteudos").param("modalidade", "XYZ").with(estudante()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveResponder400ComIdInvalido() throws Exception {
        mvc.perform(get("/api/v1/conteudos/{id}", "abc").with(estudante()))
                .andExpect(status().isBadRequest());
    }

    private static RequestPostProcessor estudante() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ESTUDANTE"));
    }

    private static ConteudoResponse conteudo(String titulo, Modalidade modalidade) {
        return new ConteudoResponse(ID, titulo, modalidade, Secao.VISAO_GERAL, "texto", "[R1]", 1,
                LocalDate.of(2026, 10, 1));
    }
}
