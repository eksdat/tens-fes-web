package br.unibh.fisiotech.shared.exception;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

class GlobalExceptionHandlerTest {

    record Entrada(@NotBlank String nome) {
    }

    @RestController
    static class ControllerDeTeste {

        @GetMapping("/inexistente")
        void inexistente() {
            throw new RecursoNaoEncontradoException("Paciente não encontrado.");
        }

        @GetMapping("/conflito")
        void conflito() {
            throw new ConflitoException("Cadastro já concluído.");
        }

        @PostMapping("/validacao")
        void validacao(@Valid @RequestBody Entrada entrada) {
        }

        @GetMapping("/numero/{id}")
        void numero(@PathVariable Long id) {
        }

        @GetMapping("/falha")
        void falha() {
            throw new IllegalStateException("select * from usuario where senha = 'x'");
        }

        @GetMapping("/negado")
        void negado() {
            throw new AccessDeniedException("sem permissão");
        }
    }

    private final MockMvc mvc = standaloneSetup(new ControllerDeTeste())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void deveResponder404ParaRecursoNaoEncontrado() throws Exception {
        mvc.perform(get("/inexistente")).andExpect(status().isNotFound());
    }

    @Test
    void deveResponder409ParaConflito() throws Exception {
        mvc.perform(get("/conflito")).andExpect(status().isConflict());
    }

    @Test
    void deveManterAMensagemDoDominioNo404() throws Exception {
        mvc.perform(get("/inexistente")).andExpect(jsonPath("$.detail").value("Paciente não encontrado."));
    }

    @Test
    void naoDeveEcoarAEntradaNemRevelarOFrameworkNoParametroInvalido() throws Exception {
        mvc.perform(get("/numero/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Requisição inválida."));
    }

    @Test
    void naoDeveRevelarOFrameworkNoJsonMalformado() throws Exception {
        mvc.perform(post("/validacao").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Requisição inválida."));
    }

    @Test
    void deveResponder500SemDetalheParaExcecaoNaoTratada() throws Exception {
        mvc.perform(get("/falha"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.detail").value("Erro interno."))
                .andExpect(content().string(not(containsString("usuario"))));
    }

    @Test
    void naoDeveTransformarAcessoNegadoEm500() {
        assertThatThrownBy(() -> mvc.perform(get("/negado")))
                .hasRootCauseInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deveIndicarOCampoInvalidoNoErroDeValidacao() throws Exception {
        mvc.perform(post("/validacao").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome").exists());
    }
}
