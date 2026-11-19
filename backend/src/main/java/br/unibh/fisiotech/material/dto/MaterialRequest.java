package br.unibh.fisiotech.material.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;

/**
 * Campos de "Criar conteúdo" (guia técnico, seção 06): título, modalidade, tema (a aba do módulo), texto e
 * referências. Texto simples ou Markdown: HTML é recusado em vez de "limpo", para o autor ver o que mudou.
 */
public record MaterialRequest(
        @NotBlank(message = "Informe o título.") @Size(min = 2, max = 200, message = "Use de 2 a 200 caracteres.")
        @Pattern(regexp = SEM_HTML, message = "Use texto simples, sem HTML.") String titulo,
        @NotNull(message = "Escolha a modalidade.") Modalidade modalidade,
        @NotNull(message = "Escolha o tema.") Secao secao,
        @NotBlank(message = "Escreva o texto do material.") @Size(max = 20000, message = "Use até 20.000 caracteres.")
        @Pattern(regexp = SEM_HTML, message = "Use texto simples ou Markdown, sem HTML.") String corpo,
        @Size(max = 2000, message = "Use até 2.000 caracteres.")
        @Pattern(regexp = SEM_HTML, message = "Use texto simples, sem HTML.") String referencias) {

    /** Recusa qualquer coisa com cara de tag ("<p", "</", "<!--", "<?"); "dor < 5" continua valendo. */
    static final String SEM_HTML = "(?s)^(?!.*<[a-zA-Z/!?]).*$";
}
