package br.unibh.fisiotech.material.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.conteudo.entity.Conteudo;
import br.unibh.fisiotech.conteudo.enums.EstadoEditorial;
import br.unibh.fisiotech.conteudo.repository.ConteudoRepository;
import br.unibh.fisiotech.material.dto.AnexoResponse;
import br.unibh.fisiotech.material.dto.LinkAnexoResponse;
import br.unibh.fisiotech.material.dto.MaterialRequest;
import br.unibh.fisiotech.material.dto.MaterialResponse;
import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.DadoInvalidoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

/**
 * Material de estudo (card "Criar e anexar material de estudo"). Rascunho é só do autor: material de outra pessoa
 * responde 404, como se não existisse. Depois de enviado, só a revisão muda o estado (RevisaoConteudoService).
 */
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final ConteudoRepository repository;
    private final AnexoService anexos;

    @Transactional(readOnly = true)
    public List<MaterialResponse> listar(UUID autor) {
        var materiais = repository.findByAutorIdOrderByAtualizadoEmDesc(autor);
        var anexosPorMaterial = anexos.dos(materiais.stream().map(Conteudo::getId).toList());
        return materiais.stream()
                .map(m -> MaterialResponse.de(m, anexosPorMaterial.getOrDefault(m.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public MaterialResponse buscar(Long id, UUID autor) {
        return resposta(doAutor(id, autor));
    }

    @Transactional
    public MaterialResponse criar(UUID autor, MaterialRequest req) {
        var material = Conteudo.rascunho(autor, titulo(req), req.modalidade(), req.secao(), req.corpo().trim(),
                limpar(req.referencias()));
        return MaterialResponse.de(repository.saveAndFlush(material), List.of());
    }

    @Transactional
    public MaterialResponse alterar(Long id, UUID autor, MaterialRequest req) {
        var material = emRascunho(id, autor);
        material.editar(titulo(req), req.modalidade(), req.secao(), req.corpo().trim(), limpar(req.referencias()));
        return resposta(repository.saveAndFlush(material));
    }

    @Transactional
    public void excluir(Long id, UUID autor) {
        var material = emRascunho(id, autor);
        anexos.removerTodos(material.getId());
        repository.delete(material);
    }

    /** O revisor não aprova sem fonte; pedir a referência aqui evita a ida e volta. */
    @Transactional
    public MaterialResponse enviarParaRevisao(Long id, UUID autor) {
        var material = emRascunho(id, autor);
        if (material.getReferencias() == null || material.getReferencias().isBlank()) {
            throw new DadoInvalidoException("referencias", "Informe a fonte antes de enviar para revisão.");
        }
        material.enviarParaRevisao();
        return resposta(repository.saveAndFlush(material));
    }

    @Transactional
    public AnexoResponse anexar(Long id, UUID autor, MultipartFile arquivo) {
        return anexos.anexar(emRascunho(id, autor).getId(), arquivo);
    }

    @Transactional
    public void removerAnexo(Long id, UUID anexoId, UUID autor) {
        anexos.remover(emRascunho(id, autor).getId(), anexoId);
    }

    /** O autor abre os próprios anexos em qualquer estado. */
    @Transactional(readOnly = true)
    public LinkAnexoResponse linkDoAnexo(Long id, UUID anexoId, UUID autor) {
        return anexos.link(doAutor(id, autor).getId(), anexoId);
    }

    private Conteudo doAutor(Long id, UUID autor) {
        return repository.findByIdAndAutorId(id, autor)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado."));
    }

    /** Enviado para revisão (ou já aprovado), o material fica como está até o revisor devolver. */
    private Conteudo emRascunho(Long id, UUID autor) {
        var material = doAutor(id, autor);
        if (material.getEstado() != EstadoEditorial.RASCUNHO) {
            throw new ConflitoException("Este material já foi enviado para revisão e não pode ser alterado.");
        }
        return material;
    }

    private MaterialResponse resposta(Conteudo material) {
        return MaterialResponse.de(material, anexos.doMaterial(material.getId()));
    }

    /** O banco exige 2 letras sem contar espaço; "@Size" sozinho deixaria passar " a". */
    private static String titulo(MaterialRequest req) {
        var titulo = req.titulo().trim();
        if (titulo.length() < 2) {
            throw new DadoInvalidoException("titulo", "Use de 2 a 200 caracteres.");
        }
        return titulo;
    }

    private static String limpar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
