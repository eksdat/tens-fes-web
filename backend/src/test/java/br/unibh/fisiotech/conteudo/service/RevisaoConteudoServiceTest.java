package br.unibh.fisiotech.conteudo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import br.unibh.fisiotech.conteudo.dto.RevisaoConteudoResponse;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Bloco;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;
import br.unibh.fisiotech.shared.exception.AcaoProibidaException;
import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

@ExtendWith(MockitoExtension.class)
class RevisaoConteudoServiceTest {

    private static final UUID WENDY = UUID.fromString("00000000-0000-4000-8000-000000000004");

    /** 23h30 do dia 10 em Brasília: em UTC já é dia 11. A data da revisão tem que ser a de Brasília. */
    private static final Clock RELOGIO = Clock.fixed(Instant.parse("2026-11-11T02:30:00Z"),
            ZoneId.of("America/Sao_Paulo"));

    @Mock
    private ConteudoRepository repository;

    private RevisaoConteudoService service;

    @BeforeEach
    void setUp() {
        service = new RevisaoConteudoService(repository, RELOGIO);
    }

    @Test
    void deveListarAFilaNaMesmaOrdemDoSite() {
        when(repository.findByEstado(EstadoEditorial.EM_REVISAO)).thenReturn(List.of(
                conteudo(1L, Modalidade.FES, Secao.VISAO_GERAL, Bloco.O_QUE_E),
                conteudo(2L, Modalidade.TENS, Secao.CASOS, null),
                conteudo(3L, Modalidade.TENS, Secao.VISAO_GERAL, Bloco.CUIDADOS),
                conteudo(4L, Modalidade.TENS, Secao.VISAO_GERAL, null),
                conteudo(5L, Modalidade.TENS, Secao.VISAO_GERAL, Bloco.O_QUE_E)));

        var fila = service.listarEmRevisao();

        assertThat(fila).extracting(RevisaoConteudoResponse::id).containsExactly(5L, 3L, 4L, 2L, 1L);
    }

    @Test
    void deveAprovarGravandoORevisorEADataDeBrasilia() {
        var conteudo = conteudo(7L, Modalidade.TENS, Secao.VISAO_GERAL, Bloco.O_QUE_E);
        when(repository.findById(7L)).thenReturn(Optional.of(conteudo));

        var resposta = service.aprovar(7L, WENDY);

        assertThat(resposta.estado()).isEqualTo(EstadoEditorial.APROVADO);
        assertThat(resposta.dataRevisao()).isEqualTo(LocalDate.of(2026, 11, 10));
        assertThat(conteudo.getRevisorId()).isEqualTo(WENDY);
    }

    @Test
    void deveDevolverParaRascunhoComOMotivo() {
        var conteudo = conteudo(7L, Modalidade.TENS, Secao.VISAO_GERAL, Bloco.EXEMPLO);
        when(repository.findById(7L)).thenReturn(Optional.of(conteudo));

        var resposta = service.devolver(7L, WENDY, "  Falta a fonte do exemplo.  ");

        assertThat(resposta.estado()).isEqualTo(EstadoEditorial.RASCUNHO);
        assertThat(resposta.motivoDevolucao()).isEqualTo("Falta a fonte do exemplo.");
        assertThat(resposta.dataRevisao()).isNull();
        assertThat(conteudo.getRevisorId()).isEqualTo(WENDY);
    }

    @Test
    void deveRecusarConteudoQueNaoEstaMaisEmRevisao() {
        var conteudo = conteudo(7L, Modalidade.TENS, Secao.VISAO_GERAL, Bloco.O_QUE_E);
        conteudo.aprovar(UUID.randomUUID(), LocalDate.of(2026, 11, 1));
        when(repository.findById(7L)).thenReturn(Optional.of(conteudo));

        assertThatThrownBy(() -> service.devolver(7L, WENDY, "Rever o texto."))
                .isInstanceOf(ConflitoException.class);
        assertThat(conteudo.getEstado()).isEqualTo(EstadoEditorial.APROVADO);
        assertThat(conteudo.getMotivoDevolucao()).isNull();
    }

    @Test
    void deveImpedirQueOAutorReviseOProprioConteudo() {
        var conteudo = conteudo(7L, Modalidade.TENS, Secao.CASOS, null);
        ReflectionTestUtils.setField(conteudo, "autorId", WENDY);
        when(repository.findById(7L)).thenReturn(Optional.of(conteudo));

        assertThatThrownBy(() -> service.aprovar(7L, WENDY))
                .isInstanceOf(AcaoProibidaException.class);
        assertThat(conteudo.getEstado()).isEqualTo(EstadoEditorial.EM_REVISAO);
    }

    @Test
    void deveDeixarOutroRevisorAprovarConteudoComAutor() {
        var conteudo = conteudo(7L, Modalidade.TENS, Secao.CASOS, null);
        ReflectionTestUtils.setField(conteudo, "autorId", UUID.randomUUID());
        when(repository.findById(7L)).thenReturn(Optional.of(conteudo));

        assertThat(service.aprovar(7L, WENDY).estado()).isEqualTo(EstadoEditorial.APROVADO);
    }

    @Test
    void deveResponder404ParaConteudoInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.aprovar(99L, WENDY)).isInstanceOf(RecursoNaoEncontradoException.class);
    }

    private static Conteudo conteudo(Long id, Modalidade modalidade, Secao secao, Bloco bloco) {
        var conteudo = new Conteudo("Texto " + id, modalidade, secao, bloco, "corpo", "[R1]",
                EstadoEditorial.EM_REVISAO, null);
        ReflectionTestUtils.setField(conteudo, "id", id);
        return conteudo;
    }
}
