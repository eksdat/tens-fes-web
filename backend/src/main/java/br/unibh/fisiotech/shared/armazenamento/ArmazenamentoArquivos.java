package br.unibh.fisiotech.shared.armazenamento;

import java.time.Duration;

/** Onde ficam os arquivos enviados (anexos). Só o backend acessa; o navegador recebe um link temporário. */
public interface ArmazenamentoArquivos {

    void guardar(String caminho, byte[] conteudo, String tipo);

    void apagar(String caminho);

    /** Link assinado para abrir o arquivo sem token, válido só por {@code validade}. */
    String linkTemporario(String caminho, Duration validade);
}
