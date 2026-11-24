package br.unibh.fisiotech.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/** O Supabase Storage não respondeu ou não está configurado neste ambiente. Vira 503 com mensagem para a pessoa. */
public class ArmazenamentoIndisponivelException extends ErrorResponseException {

    public ArmazenamentoIndisponivelException(String mensagem) {
        super(HttpStatus.SERVICE_UNAVAILABLE, ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, mensagem),
                null);
    }
}
