import { AtlasEletrodos } from '../atlas/AtlasEletrodos'
import { PerguntasFrequentes } from '../../shared/ui/PerguntasFrequentes'
import { MateriaisDeApoio } from './MateriaisDeApoio'
import { PaginaTecnica } from './PaginaTecnica'
import type { Modulo } from './tipos'

export function PaginaVisaoGeral({ modulo }: { modulo: Modulo }) {
  const { visaoGeral, eletrodos } = modulo
  return (
    <PaginaTecnica titulo="Visão geral" fontes={visaoGeral.fontes}>
      {visaoGeral.secoes.map((secao) => (
        <section key={secao.titulo} className="tf-pilha">
          <h3 className="tf-subtitulo">{secao.titulo}</h3>
          {secao.paragrafos.map((p) => (
            <p key={p} className="tf-sub">
              {p}
            </p>
          ))}
        </section>
      ))}
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
