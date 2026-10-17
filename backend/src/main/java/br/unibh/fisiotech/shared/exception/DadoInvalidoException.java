package br.unibh.fisiotech.shared.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/**
 * Regra que depende do banco (não cabe numa anotação do DTO). Responde 400 no mesmo formato do erro de validação:
 * {@code erros: {campo: mensagem}}, para o frontend ligar a mensagem ao campo.
 */
public class DadoInvalidoException extends ErrorResponseException {

    public DadoInvalidoException(String campo, String mensagem) {
        super(HttpStatus.BAD_REQUEST, problema(campo, mensagem), null);
    }

    private static ProblemDetail problema(String campo, String mensagem) {
        var p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dados inválidos.");
        p.setProperty("erros", Map.of(campo, mensagem));
        return p;
    }
}
