package br.unibh.fisiotech.parametro.service;

import java.text.Normalizer;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.parametro.dto.ParametroDicionarioResponse;
import br.unibh.fisiotech.parametro.repository.ParametroDicionarioRepository;

@Service
@RequiredArgsConstructor
public class ParametroDicionarioService {

    private final ParametroDicionarioRepository repository;

    @Transactional(readOnly = true)
    public List<ParametroDicionarioResponse> listar(String busca) {
        return repository.findAllByOrderByIdAsc().stream()
                .filter(p -> busca == null || busca.isBlank() || normalizar(p.getNome()).contains(normalizar(busca)))
                .map(ParametroDicionarioResponse::de)
                .toList();
    }

    private String normalizar(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}
