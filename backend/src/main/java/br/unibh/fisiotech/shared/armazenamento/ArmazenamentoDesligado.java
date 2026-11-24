package br.unibh.fisiotech.shared.armazenamento;

import java.time.Duration;

import br.unibh.fisiotech.shared.exception.ArmazenamentoIndisponivelException;

/** Sem {@code SUPABASE_SECRET_KEY} (ex.: rodando local sem a chave): o resto da API funciona e anexo responde 503. */
public class ArmazenamentoDesligado implements ArmazenamentoArquivos {

    private static final String DESLIGADO = "O envio de anexos está desligado neste ambiente.";

    @Override
    public void guardar(String caminho, byte[] conteudo, String tipo) {
        throw new ArmazenamentoIndisponivelException(DESLIGADO);
    }

    @Override
    public void apagar(String caminho) {
        throw new ArmazenamentoIndisponivelException(DESLIGADO);
    }

    @Override
    public String linkTemporario(String caminho, Duration validade) {
        throw new ArmazenamentoIndisponivelException(DESLIGADO);
    }
}
