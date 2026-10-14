package br.unibh.fisiotech.usuario.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.unibh.fisiotech.config.SecurityConfig;

import br.unibh.fisiotech.usuario.dto.UsuarioResponse;
import br.unibh.fisiotech.usuario.enums.Perfil;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;
import br.unibh.fisiotech.usuario.security.PerfilJwtConverter;
import br.unibh.fisiotech.usuario.service.UsuarioService;

@WebMvcTest(UsuarioController.class)
@Import({ SecurityConfig.class, PerfilJwtConverter.class })
class UsuarioControllerTest {

    private static final UUID ID = UUID.randomUUID();

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private UsuarioService service;

    @MockitoBean
    private UsuarioRepository repository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveResponder401SemToken() throws Exception {
        mvc.perform(get("/api/v1/usuarios/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveResponder404QuandoCadastroNaoFoiCompletado() throws Exception {
        when(service.buscar(ID)).thenReturn(Optional.empty());

        mvc.perform(get("/api/v1/usuarios/me").with(jwt().jwt(j -> j.subject(ID.toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveDevolverOUsuarioLogado() throws Exception {
        var usuario = new UsuarioResponse(ID, "Ana Souza", Perfil.ESTUDANTE, false, "UniBH", (short) 5,
                null, null, null);
        when(service.buscar(ID)).thenReturn(Optional.of(usuario));

        mvc.perform(get("/api/v1/usuarios/me").with(jwt().jwt(j -> j.subject(ID.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("ESTUDANTE"));
    }

    @Test
    void deveCriarCadastroComStatus201() throws Exception {
        var criado = new UsuarioResponse(ID, "Ana Souza", Perfil.ESTUDANTE, false, "UniBH", (short) 5,
                null, null, null);
        when(service.cadastrar(eq(ID), any())).thenReturn(criado);

        mvc.perform(post("/api/v1/usuarios/me").with(jwt().jwt(j -> j.subject(ID.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"aceiteTermos":true,"nome":"Ana Souza","perfil":"ESTUDANTE","instituicao":"UniBH","periodo":5}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void deveRecusarNomeComLink() throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").with(jwt().jwt(j -> j.subject(ID.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"aceiteTermos":true,"nome":"Ganhe www.premio.com","perfil":"ESTUDANTE","instituicao":"UniBH","periodo":5}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRecusarUfInexistente() throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").with(jwt().jwt(j -> j.subject(ID.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"aceiteTermos":true,"nome":"Bia Lima","perfil":"PROFISSIONAL","categoria":"FISIOTERAPEUTA","registro":"123-F","uf":"XX"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRecusarCadastroSemAceiteDosTermos() throws Exception {
        mvc.perform(post("/api/v1/usuarios/me").with(jwt().jwt(j -> j.subject(ID.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Ana Souza","perfil":"ESTUDANTE","instituicao":"UniBH","periodo":5}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.aceiteTermos").exists());
    }

    @Test
    void deveAtualizarPerfilProfissionalComStatus200() throws Exception {
        var atualizado = new UsuarioResponse(ID, "Ana Souza", Perfil.PROFISSIONAL, false, "UniBH", (short) 5,
                br.unibh.fisiotech.usuario.enums.Categoria.FISIOTERAPEUTA, "123456-F", br.unibh.fisiotech.usuario.enums.Uf.MG);
        when(service.atualizarPerfilProfissional(eq(ID), any())).thenReturn(atualizado);

        mvc.perform(put("/api/v1/usuarios/me/perfil").with(jwt().jwt(j -> j.subject(ID.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoria":"FISIOTERAPEUTA","registro":"123456-F","uf":"MG"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("PROFISSIONAL"))
                .andExpect(jsonPath("$.registro").value("123456-F"));
    }

    @Test
    void deveRecusarRegistroComFormatoInvalidoNaAtualizacao() throws Exception {
        mvc.perform(put("/api/v1/usuarios/me/perfil").with(jwt().jwt(j -> j.subject(ID.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoria":"FISIOTERAPEUTA","registro":"invalido","uf":"MG"}
                                """))
                .andExpect(status().isBadRequest());
    }
}
