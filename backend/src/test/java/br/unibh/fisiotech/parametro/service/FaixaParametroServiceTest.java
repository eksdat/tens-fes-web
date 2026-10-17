package br.unibh.fisiotech.parametro.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.dto.FaixaParametroResponse;
import br.unibh.fisiotech.parametro.entity.FaixaParametro;
import br.unibh.fisiotech.parametro.entity.ParametroDicionario;
import br.unibh.fisiotech.parametro.enums.GrupoParametro;
import br.unibh.fisiotech.parametro.enums.OrigemFaixa;
import br.unibh.fisiotech.parametro.repository.FaixaParametroRepository;

@ExtendWith(MockitoExtension.class)
class FaixaParametroServiceTest {

    @Mock
    private FaixaParametroRepository repository;

    @InjectMocks
    private FaixaParametroService service;

    @Test
    void deveDevolverAFaixaComNomeEUnidadeDoParametro() {
        var frequencia = new ParametroDicionario("Frequência", GrupoParametro.AJUSTE_BASICO, "Hz", "hertz", "x", "y");
        when(repository.findByModalidadeOrderByIdAsc(Modalidade.TENS)).thenReturn(List.of(new FaixaParametro(
                Modalidade.TENS, "Convencional", frequencia, OrigemFaixa.EDUCATIVA, new BigDecimal("50"),
                new BigDecimal("100"), "Johnson (R1)")));

        List<FaixaParametroResponse> faixas = service.listar(Modalidade.TENS);

        assertThat(faixas).singleElement().satisfies(f -> {
            assertThat(f.modo()).isEqualTo("Convencional");
            assertThat(f.parametro()).isEqualTo("Frequência");
            assertThat(f.unidade()).isEqualTo("Hz");
            assertThat(f.unidadeExtenso()).isEqualTo("hertz");
            assertThat(f.origem()).isEqualTo(OrigemFaixa.EDUCATIVA);
            assertThat(f.minimo()).isEqualByComparingTo("50");
            assertThat(f.maximo()).isEqualByComparingTo("100");
        });
    }
}
