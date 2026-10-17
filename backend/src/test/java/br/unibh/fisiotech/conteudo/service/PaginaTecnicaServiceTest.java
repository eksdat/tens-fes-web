package br.unibh.fisiotech.conteudo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.unibh.fisiotech.conteudo.dto.BlocoResponse;
import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.Bloco;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;

@ExtendWith(MockitoExtension.class)
class PaginaTecnicaServiceTest {

    @Mock
    private ConteudoRepository repository;

    @InjectMocks
    private ConteudoService service;

    @Test
    void deveDevolverOsCincoBlocosNaOrdemFixaQuandoTodosEstaoAprovados() {
        when(repository.findByModalidadeAndSecaoAndBlocoIsNotNull(Modalidade.TENS, Secao.VISAO_GERAL))
                .thenReturn(List.of(
                        aprovado(Bloco.CUIDADOS, "[R4]", LocalDate.of(2026, 10, 3)),
                        aprovado(Bloco.EXEMPLO, "Guia, seção 07", LocalDate.of(2026, 10, 1)),
                        aprovado(Bloco.O_QUE_E, "[R1]", LocalDate.of(2026, 10, 5)),
                        aprovado(Bloco.COMO_INTERPRETAR, "[R1]", LocalDate.of(2026, 10, 2)),
                        aprovado(Bloco.PARA_QUE_SERVE, "[R2]", LocalDate.of(2026, 10, 1))));

        var pagina = service.paginaTecnica(Modalidade.TENS, Secao.VISAO_GERAL);

        assertThat(pagina.liberada()).isTrue();
        assertThat(pagina.blocos()).extracting(BlocoResponse::bloco).containsExactly(Bloco.O_QUE_E,
                Bloco.PARA_QUE_SERVE, Bloco.COMO_INTERPRETAR, Bloco.EXEMPLO, Bloco.CUIDADOS);
        assertThat(pagina.dataRevisao()).isEqualTo(LocalDate.of(2026, 10, 5));
        assertThat(pagina.referencias()).containsExactly("[R1]", "[R2]", "Guia, seção 07", "[R4]");
    }

    @Test
    void deveNaoLiberarPaginaComBlocoFaltando() {
        when(repository.findByModalidadeAndSecaoAndBlocoIsNotNull(Modalidade.TENS, Secao.VISAO_GERAL))
                .thenReturn(List.of(aprovado(Bloco.O_QUE_E, "[R1]", LocalDate.of(2026, 10, 1))));

        var pagina = service.paginaTecnica(Modalidade.TENS, Secao.VISAO_GERAL);

        assertThat(pagina.liberada()).isFalse();
        assertThat(pagina.blocos()).isEmpty();
        assertThat(pagina.dataRevisao()).isNull();
    }

    @Test
    void deveNaoLiberarNemDevolverCorpoQuandoUmBlocoNaoFoiAprovado() {
        var emRevisao = new Conteudo("Cuidados", Modalidade.TENS, Secao.VISAO_GERAL, Bloco.CUIDADOS,
                "texto em revisão", "[R4]", EstadoEditorial.EM_REVISAO, null);
        when(repository.findByModalidadeAndSecaoAndBlocoIsNotNull(Modalidade.TENS, Secao.VISAO_GERAL))
                .thenReturn(List.of(
                        aprovado(Bloco.O_QUE_E, "[R1]", LocalDate.of(2026, 10, 1)),
                        aprovado(Bloco.PARA_QUE_SERVE, "[R2]", LocalDate.of(2026, 10, 1)),
                        aprovado(Bloco.COMO_INTERPRETAR, "[R1]", LocalDate.of(2026, 10, 1)),
                        aprovado(Bloco.EXEMPLO, "[R1]", LocalDate.of(2026, 10, 1)),
                        emRevisao));

        var pagina = service.paginaTecnica(Modalidade.TENS, Secao.VISAO_GERAL);

        assertThat(pagina.liberada()).isFalse();
        assertThat(pagina.blocos()).isEmpty();
        assertThat(pagina.referencias()).isEmpty();
    }

    private static Conteudo aprovado(Bloco bloco, String referencias, LocalDate data) {
        return new Conteudo(bloco.name(), Modalidade.TENS, Secao.VISAO_GERAL, bloco, "texto", referencias,
                EstadoEditorial.APROVADO, data);
    }
}
