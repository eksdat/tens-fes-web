package br.unibh.fisiotech.material.enums;

import java.util.Arrays;
import java.util.Optional;

/** Tipos aceitos em anexo (SEGURANCA.md, seção 3). Reconhecidos pelos primeiros bytes, nunca pela extensão. */
public enum TipoAnexo {
    PDF("application/pdf", "pdf", new byte[] { '%', 'P', 'D', 'F', '-' }),
    PNG("image/png", "png", new byte[] { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A }),
    JPEG("image/jpeg", "jpg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF });

    private final String mime;
    private final String extensao;
    private final byte[] assinatura;

    TipoAnexo(String mime, String extensao, byte[] assinatura) {
        this.mime = mime;
        this.extensao = extensao;
        this.assinatura = assinatura;
    }

    public String mime() {
        return mime;
    }

    public String extensao() {
        return extensao;
    }

    /** Vazio quando o começo do arquivo não é de PDF, PNG nem JPEG (um .exe renomeado para .pdf cai aqui). */
    public static Optional<TipoAnexo> pelosBytes(byte[] inicio) {
        return Arrays.stream(values()).filter(t -> t.confere(inicio)).findFirst();
    }

    private boolean confere(byte[] inicio) {
        if (inicio.length < assinatura.length) {
            return false;
        }
        return Arrays.equals(Arrays.copyOf(inicio, assinatura.length), assinatura);
    }
}
