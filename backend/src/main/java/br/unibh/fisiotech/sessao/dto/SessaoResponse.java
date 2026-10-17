package br.unibh.fisiotech.sessao.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import br.unibh.fisiotech.avaliacao.enums.Lado;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.sessao.entity.Sessao;

public record SessaoResponse(
        UUID id,
        UUID pacienteId,
        UUID profissionalId,
        Instant dataHora,
        String objetivo,
        Modalidade modalidade,
        String aparelho,
        String modo,
        BigDecimal duracaoRealMin,
        List<CanalDto> canais,
        String eletrodoTipo,
        String eletrodoDimensoes,
        Lado lado,
        String marcos,
        String montagemId,
        String sensacao,
        String contracao,
        String tolerancia,
        String fadiga,
        String ajustes,
        String medidaAntes,
        String medidaDepois,
        String medidaContexto,
        String condicaoPele,
        String motivoTermino,
        String planoReavaliacao,
        List<String> checklist,
        Instant criadoEm) {

    public static SessaoResponse de(Sessao s) {
        return new SessaoResponse(s.getId(), s.getPacienteId(), s.getCriadoPor(), s.getDataHora(), s.getObjetivo(),
                s.getModalidade(), s.getAparelho(), s.getModo(), s.getDuracaoRealMin(),
                s.getCanais().stream().map(CanalDto::de).toList(), s.getEletrodoTipo(), s.getEletrodoDimensoes(),
                s.getLado(), s.getMarcos(), s.getMontagemId(), s.getSensacao(), s.getContracao(), s.getTolerancia(),
                s.getFadiga(), s.getAjustes(), s.getMedidaAntes(), s.getMedidaDepois(), s.getMedidaContexto(),
                s.getCondicaoPele(), s.getMotivoTermino(), s.getPlanoReavaliacao(), List.copyOf(s.getChecklist()),
                s.getCriadoEm());
    }
}
