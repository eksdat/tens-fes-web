package br.unibh.fisiotech.shared.exception;

import java.util.LinkedHashMap;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Responde todo erro como {@link ProblemDetail}. As exceções de domínio estendem
 * {@link org.springframework.web.ErrorResponseException} e já carregam o status. Erro de validação ganha
 * a propriedade {@code erros} ({@code campo -> mensagem}) para o frontend ligar cada mensagem ao campo.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String MENSAGEM_ERRO_INTERNO = "Erro interno.";

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        var erros = new LinkedHashMap<String, String>();
        e.getBindingResult().getFieldErrors()
                .forEach(f -> erros.putIfAbsent(f.getField(), f.getDefaultMessage()));
        var problema = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dados inválidos.");
        problema.setProperty("erros", erros);
        return ResponseEntity.badRequest().body(problema);
    }

    /**
     * O texto padrão do Spring ecoa a entrada e cita tipos e parâmetros internos ("Failed to convert 'id' with
     * value: 'abc'"). Erro do framework sai com texto fixo; só as exceções de domínio mantêm a própria mensagem.
     */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception e, Object corpo, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        if (corpo instanceof ProblemDetail problema && !(e instanceof RecursoNaoEncontradoException)
                && !(e instanceof ConflitoException)) {
            problema.setDetail(status.is5xxServerError() ? MENSAGEM_ERRO_INTERNO : "Requisição inválida.");
        }
        return super.handleExceptionInternal(e, corpo, headers, status, request);
    }

    /** Exceção sem tratamento próprio: o detalhe vai para o log, nunca para a resposta. */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleErroInesperado(Exception e) throws Exception {
        // Erros de segurança de método (@PreAuthorize) têm tratamento próprio da cadeia de segurança: 401/403, não 500.
        if (e instanceof AccessDeniedException || e instanceof AuthenticationException) {
            throw e;
        }
        log.error("Erro inesperado", e);
        var problema = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, MENSAGEM_ERRO_INTERNO);
        return ResponseEntity.internalServerError().body(problema);
    }
}
