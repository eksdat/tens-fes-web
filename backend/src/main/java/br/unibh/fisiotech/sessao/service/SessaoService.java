package br.unibh.fisiotech.sessao.service;

import java.time.ZoneId;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.paciente.service.PacienteService;
import br.unibh.fisiotech.sessao.dto.CanalDto;
import br.unibh.fisiotech.sessao.dto.SessaoRequest;
import br.unibh.fisiotech.sessao.dto.SessaoResponse;
import br.unibh.fisiotech.sessao.entity.Sessao;
import br.unibh.fisiotech.sessao.repository.SessaoRepository;
import br.unibh.fisiotech.shared.exception.DadoInvalidoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

@Service
@RequiredArgsConstructor
public class SessaoService {

    private final SessaoRepository repository;
    private final PacienteService pacientes;

    @Transactional(readOnly = true)
    public List<SessaoResponse> listar(UUID pacienteId, UUID responsavelId) {
        pacientes.buscarDoResponsavel(pacienteId, responsavelId);
        return repository.findByPacienteIdOrderByDataHoraDesc(pacienteId).stream().map(SessaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public SessaoResponse buscar(UUID pacienteId, UUID sessaoId, UUID responsavelId) {
        pacientes.buscarDoResponsavel(pacienteId, responsavelId);
        return repository.findByIdAndPacienteId(sessaoId, pacienteId).map(SessaoResponse::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sessão não encontrada."));
    }

    @Transactional
    public SessaoResponse registrar(UUID pacienteId, UUID responsavelId, SessaoRequest req) {
        var paciente = pacientes.buscarDoResponsavel(pacienteId, responsavelId);
        if (req.dataHora().atZone(FUSO).toLocalDate().isBefore(paciente.getDataNascimento())) {
            throw new DadoInvalidoException("dataHora", "A sessão não pode ser antes do nascimento do paciente.");
        }
        var s = new Sessao(pacienteId);
        s.definirContexto(req.dataHora(), req.objetivo().trim(), req.modalidade());
        s.definirAplicacao(req.aparelho().trim(), limpar(req.modo()), req.duracaoRealMin(),
                req.canais().stream().map(CanalDto::paraEntidade).toList());
        s.definirEletrodos(req.eletrodoTipo().trim(), req.eletrodoDimensoes().trim(), req.lado(), req.marcos().trim(),
                limpar(req.montagemId()));
        s.definirResposta(limpar(req.sensacao()), limpar(req.contracao()), limpar(req.tolerancia()),
                limpar(req.fadiga()), limpar(req.ajustes()));
        s.definirResultado(limpar(req.medidaAntes()), limpar(req.medidaDepois()), limpar(req.medidaContexto()));
        s.definirEncerramento(req.condicaoPele().trim(), req.motivoTermino().trim(), req.planoReavaliacao().trim(),
                req.checklist() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(req.checklist()));
        return SessaoResponse.de(repository.saveAndFlush(s));
    }

    /** O nascimento é uma data local; a sessão chega em UTC. */
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private static String limpar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
