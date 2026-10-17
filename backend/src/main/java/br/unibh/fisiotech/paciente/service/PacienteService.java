package br.unibh.fisiotech.paciente.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import static br.unibh.fisiotech.shared.exception.Violacoes.violou;

import br.unibh.fisiotech.paciente.dto.PacienteRequest;
import br.unibh.fisiotech.paciente.dto.PacienteResponse;
import br.unibh.fisiotech.paciente.entity.Paciente;
import br.unibh.fisiotech.paciente.repository.PacienteRepository;
import br.unibh.fisiotech.shared.dto.PaginaResponse;
import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

@Service
@RequiredArgsConstructor
public class PacienteService {

    /** Campo da API → coluna. Fora desta lista, 400: o valor nunca chega ao SQL. */
    private static final Map<String, String> COLUNAS_ORDENAVEIS = Map.of(
            "nome", "nome",
            "sobrenome", "sobrenome",
            "identificador", "identificador",
            "dataNascimento", "data_nascimento",
            "criadoEm", "criado_em",
            "alteradoEm", "alterado_em");

    private static final String IDENTIFICADOR_REPETIDO = "Você já tem um paciente com este identificador.";

    private final PacienteRepository repository;

    /** Ponto único de checagem de posse: paciente de outro profissional responde igual a inexistente (404). */
    @Transactional(readOnly = true)
    public Paciente buscarDoResponsavel(UUID pacienteId, UUID responsavelId) {
        return repository.findByIdAndResponsavelId(pacienteId, responsavelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado."));
    }

    @Transactional(readOnly = true)
    public PacienteResponse buscar(UUID pacienteId, UUID responsavelId) {
        return PacienteResponse.de(buscarDoResponsavel(pacienteId, responsavelId));
    }

    @Transactional(readOnly = true)
    public PaginaResponse<PacienteResponse> listar(UUID responsavelId, String busca, String ordenar, String direcao,
            int pagina, int tamanho) {
        var coluna = COLUNAS_ORDENAVEIS.get(ordenar);
        if (coluna == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requisição inválida.");
        }
        var sentido = "desc".equalsIgnoreCase(direcao) ? Sort.Direction.DESC : Sort.Direction.ASC;
        var sort = Sort.by(sentido, coluna).and(Sort.by("id"));
        var page = repository.buscar(responsavelId, paraTsQuery(busca), PageRequest.of(pagina, tamanho, sort));
        return PaginaResponse.de(page, PacienteResponse::de);
    }

    @Transactional
    public PacienteResponse criar(UUID responsavelId, PacienteRequest req) {
        if (repository.existsByResponsavelIdAndIdentificadorIgnoreCase(responsavelId, req.identificador().trim())) {
            throw new ConflitoException(IDENTIFICADOR_REPETIDO);
        }
        var paciente = new Paciente(responsavelId);
        preencher(paciente, req);
        return salvar(paciente);
    }

    @Transactional
    public PacienteResponse atualizar(UUID pacienteId, UUID responsavelId, PacienteRequest req) {
        var paciente = buscarDoResponsavel(pacienteId, responsavelId);
        if (repository.existsByResponsavelIdAndIdentificadorIgnoreCaseAndIdNot(responsavelId,
                req.identificador().trim(), pacienteId)) {
            throw new ConflitoException(IDENTIFICADOR_REPETIDO);
        }
        preencher(paciente, req);
        return salvar(paciente);
    }

    /** Dois cadastros simultâneos passam juntos pelo exists; o índice único barra o segundo. */
    private PacienteResponse salvar(Paciente paciente) {
        try {
            return PacienteResponse.de(repository.saveAndFlush(paciente));
        } catch (DataIntegrityViolationException e) {
            if (!violou(e, "uq_paciente_identificador")) {
                throw e;
            }
            throw new ConflitoException(IDENTIFICADOR_REPETIDO);
        }
    }

    @Transactional
    public void excluir(UUID pacienteId, UUID responsavelId) {
        buscarDoResponsavel(pacienteId, responsavelId).excluir(Instant.now());
    }

    private static void preencher(Paciente p, PacienteRequest req) {
        p.atualizar(req.nome(), req.sobrenome(), req.identificador(), req.email(),
                req.dataNascimento());
    }

    /**
     * "José CASO-7" vira "José:* & CASO:* & 7:*": cada termo vira prefixo. Só letras e dígitos passam, então
     * nenhum operador do tsquery digitado pela pessoa quebra a consulta. O acento sai no banco ({@code sem_acento}).
     */
    static String paraTsQuery(String busca) {
        if (busca == null) {
            return null;
        }
        var termos = Arrays.stream(busca.split("[^\\p{L}\\p{N}]+"))
                .filter(t -> !t.isBlank())
                .map(t -> t + ":*")
                .collect(Collectors.joining(" & "));
        return termos.isEmpty() ? null : termos;
    }
}
