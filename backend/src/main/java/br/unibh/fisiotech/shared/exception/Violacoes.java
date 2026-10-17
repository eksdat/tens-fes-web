package br.unibh.fisiotech.shared.exception;

import org.springframework.dao.DataIntegrityViolationException;

public final class Violacoes {

    private Violacoes() {
    }

    /** O Postgres põe o nome da constraint na mensagem; é o único jeito de saber qual regra do banco barrou. */
    public static boolean violou(DataIntegrityViolationException e, String constraint) {
        var causa = e.getMostSpecificCause().getMessage();
        return causa != null && causa.contains(constraint);
    }
}
