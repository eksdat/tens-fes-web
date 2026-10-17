import { AtlasEletrodos } from '../atlas/AtlasEletrodos'
import { Alerta } from '../../shared/ui/Alerta'
import { PerguntasFrequentes } from '../../shared/ui/PerguntasFrequentes'
import { AVISO_CONTEUDO_PENDENTE } from './avisoPendente'
import { CorpoMarkdown } from './CorpoMarkdown'
import { MateriaisDeApoio } from './MateriaisDeApoio'
import { PaginaTecnica } from './PaginaTecnica'
import type { Modulo } from './tipos'
import { usePaginaTecnica } from './usePaginaTecnica'

/** Os cinco blocos vêm da API (só depois da revisão docente); atlas, perguntas e materiais continuam no frontend. */
export function PaginaVisaoGeral({ modulo }: { modulo: Modulo }) {
  const { visaoGeral, eletrodos } = modulo
  const pagina = usePaginaTecnica(modulo.sigla, 'VISAO_GERAL')
  const codigos = visaoGeral.fontes.map((f) => f.codigo)
  const outrasReferencias = (pagina.data?.referencias ?? []).filter((r) => !codigos.some((c) => r.includes(`[${c}]`)))

  return (
    <PaginaTecnica
      titulo="Visão geral"
      fontes={visaoGeral.fontes}
      outrasReferencias={outrasReferencias}
      dataRevisao={pagina.data?.dataRevisao}
    >
      {pagina.isPending ? (
        <output className="tf-sub">Carregando conteúdo…</output>
      ) : pagina.isError ? (
        <Alerta intencao="atencao" titulo="Não foi possível carregar o conteúdo">
          Tente de novo em alguns instantes.
        </Alerta>
      ) : pagina.data.liberada ? (
        pagina.data.blocos.map((bloco) => (
          <section key={bloco.bloco} className="tf-pilha">
            <h3 className="tf-subtitulo">{bloco.titulo}</h3>
            <CorpoMarkdown texto={bloco.corpo} />
          </section>
        ))
      ) : (
        <Alerta titulo={AVISO_CONTEUDO_PENDENTE.titulo}>{AVISO_CONTEUDO_PENDENTE.texto}</Alerta>
      )}
      {eletrodos && (
        <section className="tf-pilha">
          <h3 className="tf-subtitulo">Onde ficam os eletrodos</h3>
          <AtlasEletrodos modalidade={eletrodos.modalidade} base={`${modulo.base}/eletrodos`} compacto />
        </section>
      )}
      {visaoGeral.perguntas.length > 0 && (
        <section className="tf-pilha">
          <h3 className="tf-subtitulo">Perguntas frequentes</h3>
          <PerguntasFrequentes itens={visaoGeral.perguntas} fonteHref="#fonte-revisao" />
        </section>
      )}
      {visaoGeral.materiais && <MateriaisDeApoio itens={visaoGeral.materiais} />}
    </PaginaTecnica>
  )
}
