package br.unibh.fisiotech.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import br.unibh.fisiotech.usuario.controller.UsuarioController;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;
import br.unibh.fisiotech.usuario.security.PerfilJwtConverter;
import br.unibh.fisiotech.usuario.service.UsuarioService;

/**
 * Regra da SecurityConfig para a área de pacientes. Ainda não existe endpoint de paciente,
 * então quem passa pela segurança recebe 404; quem é barrado recebe 403.
 */
@WebMvcTest(UsuarioController.class)
@Import({ SecurityConfig.class, PerfilJwtConverter.class })
class RestricaoPorPerfilTest {

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
        mvc.perform(get("/api/v1/pacientes")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveNegarPacientesParaEstudante() throws Exception {
        mvc.perform(get("/api/v1/pacientes").with(perfil("ESTUDANTE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveNegarAvaliacoesESessoesParaEstudante() throws Exception {
        mvc.perform(get("/api/v1/pacientes/1").with(perfil("ESTUDANTE")))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/pacientes/1/sessoes").with(perfil("ESTUDANTE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveDeixarProfissionalPassarPelaSeguranca() throws Exception {
        mvc.perform(get("/api/v1/pacientes").with(perfil("PROFISSIONAL")))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveDeixarProfissionalRevisorPassarPelaSeguranca() throws Exception {
        mvc.perform(get("/api/v1/pacientes").with(perfil("PROFISSIONAL", "REVISOR")))
                .andExpect(status().isNotFound());
    }

    private static RequestPostProcessor perfil(String... papeis) {
        return jwt().authorities(Arrays.stream(papeis)
                .<GrantedAuthority>map(p -> new SimpleGrantedAuthority("ROLE_" + p))
                .toList());
    }
}
