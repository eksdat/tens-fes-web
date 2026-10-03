package br.unibh.tensfes.conteudo;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ConteudoService {

    private final ConteudoRepository repository;

    public ConteudoService(ConteudoRepository repository) {
        this.repository = repository;
    }

    public List<ConteudoResponse> listarAprovados(List<Modalidade> modalidades) {
        return repository.findByModalidadeInAndEstadoOrderByOrdemAscTituloAsc(modalidades, EstadoEditorial.APROVADO)
                .stream()
                .sorted(Comparator.comparing(Conteudo::getSecao))
                .map(ConteudoResponse::de)
                .toList();
    }

    public ConteudoResponse buscarAprovado(UUID id) {
        return repository.findByIdAndEstado(id, EstadoEditorial.APROVADO)
                .map(ConteudoResponse::de)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conteúdo não encontrado"));
    }
}
