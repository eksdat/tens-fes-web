package br.unibh.fisiotech.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/** O recurso já existe ou está num estado que impede a operação. Vira HTTP 409. */
public class ConflitoException extends ErrorResponseException {

    public ConflitoException(String mensagem) {
        super(HttpStatus.CONFLICT, ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, mensagem), null);
    }
}
