package br.unibh.fisiotech.usuario.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import br.unibh.fisiotech.shared.exception.ConflitoException;
import br.unibh.fisiotech.shared.exception.RecursoNaoEncontradoException;
import br.unibh.fisiotech.usuario.dto.AtualizarPerfilProfissionalRequest;
import br.unibh.fisiotech.usuario.dto.CadastroRequest;
import br.unibh.fisiotech.usuario.dto.UsuarioResponse;
import br.unibh.fisiotech.usuario.entity.Usuario;
import br.unibh.fisiotech.usuario.repository.UsuarioRepository;

/** Cadastro do usuário. Campos exigidos por perfil e formato do registro são validados no {@link CadastroRequest}. */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    /**
     * Versão vigente dos Termos de uso e da Política de privacidade (data da publicação). Mudou o texto das páginas
     * /termos ou /privacidade: troque aqui, para saber depois quem aceitou qual versão.
     */
    public static final String VERSAO_TERMOS = "2026-10-03";

    private final UsuarioRepository repository;

    @Transactional(readOnly = true)
    public Optional<UsuarioResponse> buscar(UUID id) {
        return repository.findById(id).map(UsuarioResponse::de);
    }

    /** A unicidade fica com a chave primária: dois cadastros simultâneos do mesmo usuário geram 409, nunca update. */
    @Transactional
    public UsuarioResponse cadastrar(UUID id, CadastroRequest req) {
        var usuario = new Usuario(id, req.nome().trim(), req.perfil());
        usuario.registrarAceiteTermos(VERSAO_TERMOS, Instant.now());
        switch (req.perfil()) {
            case ESTUDANTE -> usuario.definirDadosEstudante(req.instituicao().trim(), req.periodo());
            case PROFISSIONAL -> usuario.definirDadosProfissional(req.categoria(), req.registro().trim(), req.uf());
        }
        try {
            return UsuarioResponse.de(repository.saveAndFlush(usuario));
        } catch (DataIntegrityViolationException e) {
            throw new ConflitoException("Cadastro já concluído.");
        }
    }

    @Transactional
    public UsuarioResponse atualizarPerfilProfissional(UUID id, AtualizarPerfilProfissionalRequest req) {
        var usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cadastro não concluído."));
        usuario.promoverParaProfissional(req.categoria(), req.registro().trim(), req.uf());
        return UsuarioResponse.de(repository.saveAndFlush(usuario));
    }
}
