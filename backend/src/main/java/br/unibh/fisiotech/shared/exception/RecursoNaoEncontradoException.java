package br.unibh.fisiotech.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/**
 * Recurso inexistente ou de outro dono. Vira HTTP 404: registro de outro profissional responde igual a
 * registro inexistente, para não revelar que existe.
 */
public class RecursoNaoEncontradoException extends ErrorResponseException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(HttpStatus.NOT_FOUND, ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, mensagem), null);
    }
}
