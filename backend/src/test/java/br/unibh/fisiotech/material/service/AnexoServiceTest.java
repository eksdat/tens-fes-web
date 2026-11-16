package br.unibh.fisiotech.material.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import br.unibh.fisiotech.material.enums.TipoAnexo;

/** O nome do arquivo só aparece na tela; o caminho no bucket é sempre gerado pelo servidor. */
class AnexoServiceTest {

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "resumo.pdf|resumo.pdf",
            "C:\\fakepath\\resumo.pdf|resumo.pdf",
            "../../etc/passwd.pdf|passwd.pdf",
            "'  aula 3.pdf  '|aula 3.pdf"})
    void deveTirarPastaEEspacosDoNome(String original, String esperado) {
        assertThat(AnexoService.nomeParaMostrar(original, TipoAnexo.PDF)).isEqualTo(esperado);
    }

    @Test
    void deveDarUmNomeQuandoOArquivoVemSemNome() {
        assertThat(AnexoService.nomeParaMostrar(null, TipoAnexo.PNG)).isEqualTo("anexo.png");
        assertThat(AnexoService.nomeParaMostrar("", TipoAnexo.JPEG)).isEqualTo("anexo.jpg");
    }

    @Test
    void deveTirarCaractereDeControleECortarEm200GuardandoAExtensao() {
        var longo = "a".repeat(300) + "\u0000.pdf";

        var nome = AnexoService.nomeParaMostrar(longo, TipoAnexo.PDF);

        assertThat(nome).hasSize(200).endsWith("a.pdf").doesNotContain("\u0000");
    }
}
