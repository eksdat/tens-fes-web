package br.unibh.fisiotech.material.service;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.material.dto.AnexoResponse;
import br.unibh.fisiotech.material.dto.LinkAnexoResponse;
import br.unibh.fisiotech.material.entity.Anexo;
import br.unibh.fisiotech.material.enums.TipoAnexo;
import br.unibh.fisiotech.material.repository.AnexoRepository;
import br.unibh.fisiotech.shared.armazenamento.ArmazenamentoArquivos;
import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.DadoInvalidoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;

/**
 * Anexos de material (SEGURANCA.md, seção 3): só PDF, PNG e JPEG, até 10 MB, tipo conferido pelos bytes e caminho
 * gerado pelo servidor. Quem pode mexer em qual material é decidido antes, por quem chama.
 */
@Service
@RequiredArgsConstructor
public class AnexoService {

    static final long TAMANHO_MAXIMO = 10L * 1024 * 1024;
    static final int MAXIMO_POR_MATERIAL = 5;
    static final Duration VALIDADE_DO_LINK = Duration.ofMinutes(5);
    private static final int TAMANHO_DO_NOME = 200;

    private final AnexoRepository repository;
    private final ArmazenamentoArquivos armazenamento;
    private final Clock relogio;

    /** Uma consulta para os anexos de vários materiais (lista do autor e fila do revisor). */
    @Transactional(readOnly = true)
    public Map<Long, List<AnexoResponse>> dos(Collection<Long> conteudoIds) {
        if (conteudoIds.isEmpty()) {
            return Map.of();
        }
        return repository.findByConteudoIdInOrderByCriadoEmAsc(conteudoIds).stream()
                .collect(Collectors.groupingBy(Anexo::getConteudoId,
                        Collectors.mapping(AnexoResponse::de, Collectors.toList())));
    }

    public List<AnexoResponse> doMaterial(Long conteudoId) {
        return dos(List.of(conteudoId)).getOrDefault(conteudoId, List.of());
    }

    /** Grava a linha e depois o arquivo: se o Storage falhar, a transação desfaz a linha. */
    @Transactional
    public AnexoResponse anexar(Long conteudoId, MultipartFile arquivo) {
        if (repository.countByConteudoId(conteudoId) >= MAXIMO_POR_MATERIAL) {
            throw new ConflitoException("Use até " + MAXIMO_POR_MATERIAL + " anexos por material.");
        }
        if (arquivo.isEmpty()) {
            throw new DadoInvalidoException("arquivo", "Escolha um arquivo.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO) {
            throw new DadoInvalidoException("arquivo", "O arquivo passa de 10 MB.");
        }
        var conteudo = bytes(arquivo);
        var tipo = TipoAnexo.pelosBytes(conteudo).orElseThrow(
                () -> new DadoInvalidoException("arquivo", "Envie um PDF ou uma imagem PNG ou JPEG."));
        var caminho = "material-" + conteudoId + "-" + UUID.randomUUID() + "." + tipo.extensao();
        var anexo = repository.saveAndFlush(
                new Anexo(conteudoId, nomeParaMostrar(arquivo.getOriginalFilename(), tipo), tipo, conteudo.length, caminho));
        armazenamento.guardar(caminho, conteudo, tipo.mime());
        return AnexoResponse.de(anexo);
    }

    @Transactional
    public void remover(Long conteudoId, UUID anexoId) {
        var anexo = doConteudo(conteudoId, anexoId);
        repository.delete(anexo);
        repository.flush();
        armazenamento.apagar(anexo.getCaminho());
    }

    /** Antes de apagar o material: tira os arquivos do bucket (a linha sai junto, em cascata). */
    @Transactional
    public void removerTodos(Long conteudoId) {
        repository.findByConteudoIdInOrderByCriadoEmAsc(List.of(conteudoId))
                .forEach(a -> armazenamento.apagar(a.getCaminho()));
    }

    @Transactional(readOnly = true)
    public LinkAnexoResponse link(Long conteudoId, UUID anexoId) {
        var anexo = doConteudo(conteudoId, anexoId);
        var url = armazenamento.linkTemporario(anexo.getCaminho(), VALIDADE_DO_LINK);
        return new LinkAnexoResponse(url, Instant.now(relogio).plus(VALIDADE_DO_LINK));
    }

    private Anexo doConteudo(Long conteudoId, UUID anexoId) {
        return repository.findByIdAndConteudoId(anexoId, conteudoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anexo não encontrado."));
    }

    private static byte[] bytes(MultipartFile arquivo) {
        try {
            return arquivo.getBytes();
        } catch (IOException e) {
            throw new DadoInvalidoException("arquivo", "Não foi possível ler o arquivo. Tente de novo.");
        }
    }

    /** Só para mostrar na tela: sem pasta, sem caractere de controle e com no máximo 200 caracteres. */
    static String nomeParaMostrar(String original, TipoAnexo tipo) {
        var nome = original == null ? "" : original.replaceAll(".*[/\\\\]", "").replaceAll("\\p{Cntrl}", "").trim();
        if (nome.isEmpty()) {
            nome = "anexo." + tipo.extensao();
        }
        return nome.length() > TAMANHO_DO_NOME ? nome.substring(nome.length() - TAMANHO_DO_NOME) : nome;
    }
}
