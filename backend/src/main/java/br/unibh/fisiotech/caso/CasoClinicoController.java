package br.unibh.fisiotech.caso;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.unibh.fisiotech.conteudo.dto.PaginaTecnicaResponse;
import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.conteudo.enums.Secao;
import br.unibh.fisiotech.conteudo.service.ConteudoService;
import br.unibh.fisiotech.material.enums.TipoAnexo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/casos-clinicos")
@RequiredArgsConstructor
public class CasoClinicoController {
    private final JdbcClient banco;
    private final ConteudoService conteudo;

    public record Envio(
            @NotBlank @Size(max = 120) String titulo,
            @NotBlank @Size(max = 2000) String objetivo,
            @NotBlank @Size(max = 2000) String contexto,
            @NotBlank @Size(max = 2000) String avaliacao,
            @NotBlank @Pattern(regexp = "TENS|NMES|FES") String modalidade,
            @NotBlank @Size(max = 2000) String parametros,
            @NotBlank @Size(max = 2000) String montagem,
            @NotBlank @Size(max = 2000) String justificativa,
            @NotBlank @Size(max = 2000) String duvida) {}

    public record Resumo(UUID id, String titulo, OffsetDateTime criadoEm) {}
    public record Anexo(UUID id, String nome) {}
    public record Detalhe(Envio caso, List<Anexo> anexos, PaginaTecnicaResponse origem) {}

    private record Arquivo(String nome, String mime, byte[] dados) {}

    @GetMapping
    public List<Resumo> listar(@AuthenticationPrincipal Jwt jwt) {
        return banco.sql("""
                select id, titulo, criado_em from caso_clinico
                where estudante_id = ? order by criado_em desc, id
                """).param(UUID.fromString(jwt.getSubject())).query(Resumo.class).list();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional(rollbackFor = IOException.class)
    public UUID enviar(@AuthenticationPrincipal Jwt jwt, @RequestPart @Valid Envio caso,
            @RequestPart(required = false) List<MultipartFile> anexos) throws IOException {
        var arquivos = validarAnexos(anexos == null ? List.of() : anexos);
        var id = UUID.randomUUID();
        banco.sql("""
                insert into caso_clinico (id, estudante_id, titulo, objetivo, contexto, avaliacao,
                    modalidade, parametros, montagem, justificativa, duvida)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """).params(id, UUID.fromString(jwt.getSubject()), caso.titulo().trim(), caso.objetivo(),
                        caso.contexto(), caso.avaliacao(), caso.modalidade(), caso.parametros(),
                        caso.montagem(), caso.justificativa(), caso.duvida()).update();
        for (var arquivo : arquivos) {
            banco.sql("insert into caso_clinico_anexo (id, caso_id, nome, mime, dados) values (?, ?, ?, ?, ?)")
                    .params(UUID.randomUUID(), id, arquivo.nome(), arquivo.mime(), arquivo.dados()).update();
        }
        return id;
    }

    @GetMapping("/{id}")
    public Detalhe buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        var caso = banco.sql("""
                select titulo, objetivo, contexto, avaliacao, modalidade, parametros, montagem, justificativa, duvida
                from caso_clinico where id = ? and estudante_id = ?
                """).params(id, UUID.fromString(jwt.getSubject())).query(Envio.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var anexos = banco.sql("select id, nome from caso_clinico_anexo where caso_id = ? order by nome, id")
                .param(id).query(Anexo.class).list();
        var modulo = "TENS".equals(caso.modalidade()) ? Modalidade.TENS : Modalidade.FES;
        return new Detalhe(caso, anexos, conteudo.paginaTecnica(modulo, Secao.VISAO_GERAL));
    }

    @GetMapping("/{id}/anexos/{anexoId}")
    public ResponseEntity<byte[]> baixar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @PathVariable UUID anexoId) {
        var arquivo = banco.sql("""
                select a.nome, a.mime, a.dados from caso_clinico_anexo a
                join caso_clinico c on c.id = a.caso_id
                where c.id = ? and c.estudante_id = ? and a.id = ?
                """).params(id, UUID.fromString(jwt.getSubject()), anexoId).query(Arquivo.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header("Content-Disposition", "attachment")
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(arquivo.mime())).body(arquivo.dados());
    }

    private List<Arquivo> validarAnexos(List<MultipartFile> anexos) throws IOException {
        if (anexos.size() > 5 || anexos.stream().mapToLong(MultipartFile::getSize).sum() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Envie até cinco anexos, somando até 10 MB.");
        }
        var arquivos = new ArrayList<Arquivo>();
        for (var anexo : anexos) {
            var dados = anexo.getBytes();
            var tipo = TipoAnexo.pelosBytes(dados).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie PDF, PNG ou JPEG."));
            var nome = anexo.getOriginalFilename();
            if (nome == null || nome.isBlank() || nome.length() > 160 || nome.matches("(?s).*[\\\\/\\p{Cntrl}].*")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome de anexo inválido.");
            }
            arquivos.add(new Arquivo(nome, tipo.mime(), dados));
        }
        return arquivos;
    }
}
