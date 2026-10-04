package br.unibh.fisiotech.conteudo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import br.unibh.fisiotech.TestcontainersConfiguration;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;

/** Flyway, mapeamento e consultas com PostgreSQL real (Testcontainers). Cada teste é desfeito no final. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class ConteudoIntegracaoTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ConteudoRepository repository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void deveCarregarOGuiaSemPublicarNadaAntesDaRevisao() throws Exception {
        assertThat(repository.findAll()).isNotEmpty()
                .allMatch(c -> c.getEstado() == EstadoEditorial.EM_REVISAO);

        mvc.perform(get("/api/v1/conteudos").param("modalidade", "TENS", "FES", "NMES").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void deveListarSoOsAprovadosNaOrdemDaAba() throws Exception {
        repository.save(conteudo("FES", Modalidade.FES, EstadoEditorial.APROVADO));
        repository.save(conteudo("NMES", Modalidade.NMES, EstadoEditorial.APROVADO));
        repository.save(conteudo("FES em revisao", Modalidade.FES, EstadoEditorial.EM_REVISAO));

        mvc.perform(get("/api/v1/conteudos").param("modalidade", "FES", "NMES").with(estudante()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].titulo").value("FES"))
                .andExpect(jsonPath("$[1].titulo").value("NMES"));
    }

    @Test
    void deveResponder404ParaConteudoEmRevisao() throws Exception {
        var salvo = repository.save(conteudo("TENS em revisao", Modalidade.TENS, EstadoEditorial.EM_REVISAO));

        mvc.perform(get("/api/v1/conteudos/{id}", salvo.getId()).with(estudante()))
                .andExpect(status().isNotFound());
    }

    private static RequestPostProcessor estudante() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ESTUDANTE"));
    }

    private static Conteudo conteudo(String titulo, Modalidade modalidade, EstadoEditorial estado) {
        var data = estado == EstadoEditorial.APROVADO ? LocalDate.of(2026, 10, 1) : null;
        return new Conteudo(titulo, modalidade, Secao.VISAO_GERAL, "texto", "[R1]", estado, data);
    }
}
