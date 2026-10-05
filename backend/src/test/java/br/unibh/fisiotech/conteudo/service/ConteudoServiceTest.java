package br.unibh.fisiotech.conteudo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.unibh.fisiotech.conteudo.dto.ConteudoResponse;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

@ExtendWith(MockitoExtension.class)
class ConteudoServiceTest {

    private static final Long ID = 1L;

    @Mock
    private ConteudoRepository repository;

    @InjectMocks
    private ConteudoService service;

    @Test
    void deveListarNaOrdemDasAbasDoModulo() {
        var modos = aprovado("Modos de TENS", Secao.PARAMETROS);
        var oQueE = aprovado("O que e TENS", Secao.VISAO_GERAL);
        var evidencia = aprovado("Evidencia", Secao.VISAO_GERAL);
        when(repository.findByModalidadeInAndEstadoOrderByIdAsc(List.of(Modalidade.TENS),
                EstadoEditorial.APROVADO)).thenReturn(List.of(modos, oQueE, evidencia));

        var lista = service.listarAprovados(List.of(Modalidade.TENS));

        assertThat(lista).extracting(ConteudoResponse::titulo)
                .containsExactly("O que e TENS", "Evidencia", "Modos de TENS");
    }

    @Test
    void deveBuscarConteudoAprovado() {
        when(repository.findByIdAndEstado(ID, EstadoEditorial.APROVADO))
                .thenReturn(Optional.of(aprovado("O que e TENS", Secao.VISAO_GERAL)));

        assertThat(service.buscarAprovado(ID).titulo()).isEqualTo("O que e TENS");
    }

    @Test
    void deveLancar404QuandoConteudoNaoFoiAprovado() {
        when(repository.findByIdAndEstado(ID, EstadoEditorial.APROVADO)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarAprovado(ID)).isInstanceOf(RecursoNaoEncontradoException.class);
    }

    private Conteudo aprovado(String titulo, Secao secao) {
        return new Conteudo(titulo, Modalidade.TENS, secao, "texto", "[R1]", EstadoEditorial.APROVADO,
                LocalDate.of(2026, 10, 1));
    }
}
