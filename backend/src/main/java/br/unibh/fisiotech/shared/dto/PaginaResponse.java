package br.unibh.fisiotech.shared.dto;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

/** Página com contrato estável: o JSON do {@code Page} do Spring muda entre versões. */
public record PaginaResponse<T>(List<T> itens, int pagina, int tamanho, long totalItens, int totalPaginas) {

    public static <E, T> PaginaResponse<T> de(Page<E> page, Function<E, T> mapear) {
        return new PaginaResponse<>(page.getContent().stream().map(mapear).toList(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
