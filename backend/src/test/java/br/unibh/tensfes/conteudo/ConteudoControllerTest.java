package br.unibh.tensfes.conteudo;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import br.unibh.tensfes.TestcontainersConfiguration;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class ConteudoControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ConteudoRepository repository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    @WithMockUser
    void listaSoOsAprovados() throws Exception {
        repository.save(conteudo("TENS aprovado", Modalidade.TENS, 1, EstadoEditorial.APROVADO));
        repository.save(conteudo("TENS em revisão", Modalidade.TENS, 2, EstadoEditorial.EM_REVISAO));
        repository.save(conteudo("FES aprovado", Modalidade.FES, 1, EstadoEditorial.APROVADO));

        mockMvc.perform(get("/api/v1/conteudos").param("modalidade", "TENS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("TENS aprovado"));
    }

    @Test
    @WithMockUser
    void listaFesENmesJuntos() throws Exception {
        repository.save(conteudo("NMES", Modalidade.NMES, 2, EstadoEditorial.APROVADO));
        repository.save(conteudo("FES", Modalidade.FES, 1, EstadoEditorial.APROVADO));

        mockMvc.perform(get("/api/v1/conteudos").param("modalidade", "FES", "NMES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("FES"))
                .andExpect(jsonPath("$[1].titulo").value("NMES"));
    }

    @Test
    @WithMockUser
    void buscaPorId() throws Exception {
        var salvo = repository.save(conteudo("TENS aprovado", Modalidade.TENS, 1, EstadoEditorial.APROVADO));

        mockMvc.perform(get("/api/v1/conteudos/{id}", salvo.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("TENS aprovado"));
    }

    @Test
    @WithMockUser
    void naoMostraConteudoEmRevisao() throws Exception {
        var salvo = repository.save(conteudo("TENS em revisão", Modalidade.TENS, 1, EstadoEditorial.EM_REVISAO));

        mockMvc.perform(get("/api/v1/conteudos/{id}", salvo.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void idQueNaoExiste() throws Exception {
        mockMvc.perform(get("/api/v1/conteudos/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void modalidadeInvalida() throws Exception {
        mockMvc.perform(get("/api/v1/conteudos").param("modalidade", "XYZ"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void semLoginNaoAcessa() throws Exception {
        mockMvc.perform(get("/api/v1/conteudos").param("modalidade", "TENS"))
                .andExpect(status().is4xxClientError());
    }

    private Conteudo conteudo(String titulo, Modalidade modalidade, int ordem, EstadoEditorial estado) {
        var data = estado == EstadoEditorial.APROVADO ? LocalDate.of(2026, 10, 1) : null;
        return new Conteudo(titulo, modalidade, Secao.VISAO_GERAL, ordem, "texto", "[R1]", estado, data);
    }
}
