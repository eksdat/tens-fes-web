package br.unibh.fisiotech.parametro.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.unibh.fisiotech.parametro.dto.ParametroDicionarioResponse;
import br.unibh.fisiotech.parametro.entity.ParametroDicionario;
import br.unibh.fisiotech.parametro.enums.GrupoParametro;
import br.unibh.fisiotech.parametro.repository.ParametroDicionarioRepository;

@ExtendWith(MockitoExtension.class)
class ParametroDicionarioServiceTest {

    @Mock
    private ParametroDicionarioRepository repository;

    @InjectMocks
    private ParametroDicionarioService service;

    @BeforeEach
    void setUp() {
        when(repository.findAllByOrderByIdAsc()).thenReturn(List.of(
                parametro("Frequência", GrupoParametro.AJUSTE_BASICO, "Hz", "hertz"),
                parametro("Largura de pulso", GrupoParametro.AJUSTE_BASICO, "µs", "microssegundos"),
                parametro("Rampa de subida", GrupoParametro.RECURSO_ESPECIFICO, "s", "segundos"),
                parametro("Rampa de descida", GrupoParametro.RECURSO_ESPECIFICO, "s", "segundos")));
    }

    @Test
    void deveListarTodosSemBusca() {
        assertThat(service.listar(null)).hasSize(4);
        assertThat(service.listar("  ")).hasSize(4);
    }

    @Test
    void deveBuscarIgnorandoAcentoEMaiuscula() {
        assertThat(service.listar("FREQUENCIA")).extracting(ParametroDicionarioResponse::nome)
                .containsExactly("Frequência");
    }

    @Test
    void deveBuscarPorParteDoNomeMantendoAOrdem() {
        assertThat(service.listar("rampa")).extracting(ParametroDicionarioResponse::nome)
                .containsExactly("Rampa de subida", "Rampa de descida");
    }

    @Test
    void deveDevolverListaVaziaQuandoNaoAcha() {
        assertThat(service.listar("xyz")).isEmpty();
    }

    @Test
    void deveDevolverAUnidadePorExtenso() {
        assertThat(service.listar("pulso")).extracting(ParametroDicionarioResponse::unidadeExtenso)
                .containsExactly("microssegundos");
    }

    private static ParametroDicionario parametro(String nome, GrupoParametro grupo, String unidade, String extenso) {
        return new ParametroDicionario(nome, grupo, unidade, extenso, "o que muda", "exemplo");
    }
}
