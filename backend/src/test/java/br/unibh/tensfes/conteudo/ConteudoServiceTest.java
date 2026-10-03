package br.unibh.tensfes.conteudo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ConteudoServiceTest {

    @Mock
    private ConteudoRepository repository;

    @InjectMocks
    private ConteudoService service;

    @Test
    void listaNaOrdemDasAbas() {
        var modos = aprovado("Modos de TENS", Secao.PARAMETROS, 1);
        var oQueE = aprovado("O que é TENS", Secao.VISAO_GERAL, 1);
        var evidencia = aprovado("Evidência", Secao.VISAO_GERAL, 2);
        when(repository.findByModalidadeInAndEstadoOrderByOrdemAscTituloAsc(List.of(Modalidade.TENS), EstadoEditorial.APROVADO))
                .thenReturn(List.of(modos, oQueE, evidencia));

        var lista = service.listarAprovados(List.of(Modalidade.TENS));

        assertThat(lista).extracting(ConteudoResponse::titulo)
                .containsExactly("O que é TENS", "Evidência", "Modos de TENS");
    }

    @Test
    void buscaConteudoAprovado() {
        var id = UUID.randomUUID();
        when(repository.findByIdAndEstado(id, EstadoEditorial.APROVADO))
                .thenReturn(Optional.of(aprovado("O que é TENS", Secao.VISAO_GERAL, 1)));

        assertThat(service.buscarAprovado(id).titulo()).isEqualTo("O que é TENS");
    }

    @Test
    void naoAchaConteudoQueNaoFoiAprovado() {
        var id = UUID.randomUUID();
        when(repository.findByIdAndEstado(id, EstadoEditorial.APROVADO)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.buscarAprovado(id));
    }

    private Conteudo aprovado(String titulo, Secao secao, int ordem) {
        return new Conteudo(titulo, Modalidade.TENS, secao, ordem, "texto", "[R1]",
                EstadoEditorial.APROVADO, LocalDate.of(2026, 10, 1));
    }
}
