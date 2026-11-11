package br.unibh.fisiotech.conteudo.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import br.unibh.fisiotech.config.SecurityConfig;
import br.unibh.fisiotech.conteudo.dto.RevisaoConteudoResponse;
import br.unibh.fisiotech.conteudo.enums.Bloco;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.service.RevisaoConteudoService;
import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;
import br.unibh.fisiotech.usuario.security.PerfilJwtConverter;

@WebMvcTest(RevisaoConteudoController.class)
@Import({ SecurityConfig.class, PerfilJwtConverter.class })
class RevisaoConteudoControllerTest {

    private static final UUID WENDY = UUID.fromString("00000000-0000-4000-8000-000000000004");

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private RevisaoConteudoService service;

    @MockitoBean
    private UsuarioRepository repository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveResponder401SemToken() throws Exception {
        mvc.perform(get("/api/v1/revisao/conteudos")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveNegarEstudante() throws Exception {
        mvc.perform(get("/api/v1/revisao/conteudos").with(papeis("aal2", "ESTUDANTE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveNegarProfissionalQueNaoERevisor() throws Exception {
        mvc.perform(post("/api/v1/revisao/conteudos/7/aprovar").with(papeis("aal2", "PROFISSIONAL")))
                .andExpect(status().isForbidden());
        verify(service, never()).aprovar(any(), any());
    }

    @Test
    void deveNegarRevisorSemVerificacaoEmDuasEtapas() throws Exception {
        mvc.perform(get("/api/v1/revisao/conteudos").with(papeis("aal1", "PROFISSIONAL", "REVISOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveListarAFilaParaORevisor() throws Exception {
        when(service.listarEmRevisao()).thenReturn(List.of(resposta(EstadoEditorial.EM_REVISAO, null)));

        mvc.perform(get("/api/v1/revisao/conteudos").with(revisora()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("O que é TENS"))
                .andExpect(jsonPath("$[0].bloco").value("O_QUE_E"))
                .andExpect(jsonPath("$[0].estado").value("EM_REVISAO"));
    }

    @Test
    void deveAprovarEmNomeDoRevisorDoToken() throws Exception {
        when(service.aprovar(7L, WENDY)).thenReturn(resposta(EstadoEditorial.APROVADO, null));

        mvc.perform(post("/api/v1/revisao/conteudos/7/aprovar").with(revisora()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROVADO"))
                .andExpect(jsonPath("$.dataRevisao").value("2026-11-11"));
    }

    @Test
    void deveDevolverComOMotivo() throws Exception {
        when(service.devolver(7L, WENDY, "Falta a fonte."))
                .thenReturn(resposta(EstadoEditorial.RASCUNHO, "Falta a fonte."));

        mvc.perform(post("/api/v1/revisao/conteudos/7/devolver").with(revisora())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Falta a fonte.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RASCUNHO"))
                .andExpect(jsonPath("$.motivoDevolucao").value("Falta a fonte."));
    }

    @Test
    void deveExigirOMotivoParaDevolver() throws Exception {
        mvc.perform(post("/api/v1/revisao/conteudos/7/devolver").with(revisora())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.motivo").value("Escreva o motivo da devolução."));
        verify(service, never()).devolver(any(), any(), any());
    }

    @Test
    void deveRecusarMotivoComMaisDe500Caracteres() throws Exception {
        var motivo = "a".repeat(501);

        mvc.perform(post("/api/v1/revisao/conteudos/7/devolver").with(revisora())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"" + motivo + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.motivo").value("Use até 500 caracteres."));
    }

    @Test
    void deveResponder409QuandoOConteudoNaoEstaMaisEmRevisao() throws Exception {
        when(service.aprovar(7L, WENDY))
                .thenThrow(new ConflitoException("Este conteúdo não está mais em revisão."));

        mvc.perform(post("/api/v1/revisao/conteudos/7/aprovar").with(revisora()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Este conteúdo não está mais em revisão."));
    }

    @Test
    void deveResponder404ParaConteudoInexistente() throws Exception {
        when(service.aprovar(99L, WENDY)).thenThrow(new RecursoNaoEncontradoException("Conteúdo não encontrado."));

        mvc.perform(post("/api/v1/revisao/conteudos/99/aprovar").with(revisora()))
                .andExpect(status().isNotFound());
    }

    private static RequestPostProcessor revisora() {
        return papeis("aal2", "PROFISSIONAL", "REVISOR");
    }

    private static RequestPostProcessor papeis(String aal, String... papeis) {
        return jwt().jwt(j -> j.subject(WENDY.toString()).claim("aal", aal)).authorities(Arrays.stream(papeis)
                .<GrantedAuthority>map(p -> new SimpleGrantedAuthority("ROLE_" + p))
                .toList());
    }

    private static RevisaoConteudoResponse resposta(EstadoEditorial estado, String motivo) {
        return new RevisaoConteudoResponse(7L, "O que é TENS", Modalidade.TENS, Secao.VISAO_GERAL, Bloco.O_QUE_E,
                "texto", "[R1]", 1, estado, estado == EstadoEditorial.APROVADO ? LocalDate.of(2026, 11, 11) : null,
                motivo);
    }
}
