package br.unibh.fisiotech.material.dto;

import java.time.Instant;

/** Link assinado do Supabase Storage, válido por 5 minutos (SEGURANCA.md, seção 3). */
public record LinkAnexoResponse(String url, Instant expiraEm) {
}
