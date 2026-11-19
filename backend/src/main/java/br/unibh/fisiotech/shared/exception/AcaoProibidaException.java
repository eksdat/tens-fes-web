package br.unibh.fisiotech.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/**
 * A pessoa tem o papel certo, mas a regra não deixa fazer esta ação neste registro (ex.: revisar o próprio
 * texto). Vira HTTP 403 com a mensagem do domínio, diferente do 403 genérico da cadeia de segurança.
 */
public class AcaoProibidaException extends ErrorResponseException {

    public AcaoProibidaException(String mensagem) {
        super(HttpStatus.FORBIDDEN, ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, mensagem), null);
    }
}
