package br.unibh.fisiotech.sessao.entity;

public record Planejamento(String relato, Referencia referencia, Integer larguraPulsoUs) {
    public record Referencia(String id, String versao, String titulo, String url) {
    }
}
