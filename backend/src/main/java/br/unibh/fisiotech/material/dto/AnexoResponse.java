package br.unibh.fisiotech.material.dto;

import java.time.Instant;
import java.util.UUID;

import br.unibh.fisiotech.material.entity.Anexo;
import br.unibh.fisiotech.material.enums.TipoAnexo;

/** Sem o caminho no bucket: o arquivo só abre pelo link temporário. */
public record AnexoResponse(UUID id, String nome, TipoAnexo tipo, Integer tamanhoBytes, Instant criadoEm) {

    public static AnexoResponse de(Anexo a) {
        return new AnexoResponse(a.getId(), a.getNome(), a.getTipo(), a.getTamanhoBytes(), a.getCriadoEm());
    }
}
