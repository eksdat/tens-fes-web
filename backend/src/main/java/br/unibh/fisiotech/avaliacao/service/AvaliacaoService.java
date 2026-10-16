package br.unibh.fisiotech.avaliacao.service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.avaliacao.dto.AvaliacaoRequest;
import br.unibh.fisiotech.avaliacao.dto.AvaliacaoResponse;
import br.unibh.fisiotech.avaliacao.entity.Achado;
import br.unibh.fisiotech.avaliacao.entity.Avaliacao;
import br.unibh.fisiotech.avaliacao.enums.EstadoAchado;
import br.unibh.fisiotech.avaliacao.enums.ItemTriagem;
import br.unibh.fisiotech.avaliacao.repository.AvaliacaoRepository;
import br.unibh.fisiotech.paciente.service.PacienteService;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository repository;
    private final PacienteService pacientes;

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listar(UUID pacienteId, UUID responsavelId, boolean crescente) {
        pacientes.buscarDoResponsavel(pacienteId, responsavelId);
        var sentido = crescente ? Sort.Direction.ASC : Sort.Direction.DESC;
        return repository.findByPacienteId(pacienteId, Sort.by(sentido, "dataAvaliacao", "criadoEm")).stream()
                .map(AvaliacaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponse buscar(UUID pacienteId, UUID avaliacaoId, UUID responsavelId) {
        return AvaliacaoResponse.de(buscarDoResponsavel(pacienteId, avaliacaoId, responsavelId));
    }

    @Transactional
    public AvaliacaoResponse criar(UUID pacienteId, UUID responsavelId, AvaliacaoRequest req) {
        pacientes.buscarDoResponsavel(pacienteId, responsavelId);
        var avaliacao = new Avaliacao(pacienteId);
        preencher(avaliacao, req);
        return AvaliacaoResponse.de(repository.saveAndFlush(avaliacao));
    }

    @Transactional
    public AvaliacaoResponse atualizar(UUID pacienteId, UUID avaliacaoId, UUID responsavelId, AvaliacaoRequest req) {
        var avaliacao = buscarDoResponsavel(pacienteId, avaliacaoId, responsavelId);
        preencher(avaliacao, req);
        return AvaliacaoResponse.de(repository.saveAndFlush(avaliacao));
    }

    private Avaliacao buscarDoResponsavel(UUID pacienteId, UUID avaliacaoId, UUID responsavelId) {
        pacientes.buscarDoResponsavel(pacienteId, responsavelId);
        return repository.findByIdAndPacienteId(avaliacaoId, pacienteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Avaliação não encontrada."));
    }

    private static void preencher(Avaliacao a, AvaliacaoRequest req) {
        a.atualizar(req.dataAvaliacao(), limpar(req.queixa()), limpar(req.historico()), req.dorEscala(),
                limpar(req.dorContexto()), limpar(req.dorTarefa()), limpar(req.dorMomento()), limpar(req.objetivo()),
                limpar(req.plano()), triagemCompleta(req.triagem()), achados(req));
    }

    /** Todo item da triagem é gravado: o que não veio fica NAO_AVALIADO, para nunca ser lido como ausência de risco. */
    private static Map<ItemTriagem, EstadoAchado> triagemCompleta(Map<ItemTriagem, EstadoAchado> recebida) {
        var triagem = new EnumMap<ItemTriagem, EstadoAchado>(ItemTriagem.class);
        for (var item : ItemTriagem.values()) {
            var estado = recebida == null ? null : recebida.get(item);
            triagem.put(item, estado == null ? EstadoAchado.NAO_AVALIADO : estado);
        }
        return triagem;
    }

    private static List<Achado> achados(AvaliacaoRequest req) {
        if (req.achados() == null) {
            return List.of();
        }
        return req.achados().stream().map(a -> new Achado(a.bloco(), a.descricao().trim(),
                a.estado() == null ? EstadoAchado.NAO_AVALIADO : a.estado(), a.lado(), a.regiao().trim(),
                a.metodo().trim())).toList();
    }

    private static String limpar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
