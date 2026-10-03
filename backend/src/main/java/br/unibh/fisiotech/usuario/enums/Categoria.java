package br.unibh.fisiotech.usuario.enums;

import java.util.regex.Pattern;

/** Categoria profissional e o formato do registro no conselho (sufixo do CREFITO: F ou TO). */
public enum Categoria {
    FISIOTERAPEUTA("\\d{1,7}-F"),
    TERAPEUTA_OCUPACIONAL("\\d{1,7}-TO"),
    OUTRA(".+");

    private final Pattern formatoRegistro;

    Categoria(String formatoRegistro) {
        this.formatoRegistro = Pattern.compile(formatoRegistro);
    }

    public boolean aceitaRegistro(String registro) {
        return formatoRegistro.matcher(registro).matches();
    }
}
