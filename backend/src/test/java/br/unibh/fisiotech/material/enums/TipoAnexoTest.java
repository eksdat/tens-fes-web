package br.unibh.fisiotech.material.enums;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class TipoAnexoTest {

    static Stream<Arguments> arquivos() {
        return Stream.of(
                Arguments.of("PDF", "%PDF-1.7 resto".getBytes(), Optional.of(TipoAnexo.PDF)),
                Arguments.of("PNG", new byte[] { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0 },
                        Optional.of(TipoAnexo.PNG)),
                Arguments.of("JPEG", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0 },
                        Optional.of(TipoAnexo.JPEG)),
                Arguments.of("executável", "MZ\u0090".getBytes(), Optional.empty()),
                Arguments.of("GIF", "GIF89a".getBytes(), Optional.empty()),
                Arguments.of("texto com %PDF no meio", "olá %PDF-".getBytes(), Optional.empty()),
                Arguments.of("arquivo curto", new byte[] { '%', 'P' }, Optional.empty()));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("arquivos")
    void deveReconhecerOTipoPelosPrimeirosBytes(String caso, byte[] inicio, Optional<TipoAnexo> esperado) {
        assertThat(TipoAnexo.pelosBytes(inicio)).isEqualTo(esperado);
    }
}
