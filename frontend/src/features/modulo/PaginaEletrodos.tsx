import { AtlasEletrodos } from '../atlas/AtlasEletrodos'
import { MateriaisDeApoio } from './MateriaisDeApoio'
import { PaginaTecnica } from './PaginaTecnica'
import type { Modulo } from './tipos'

export function PaginaEletrodos({ modulo }: { modulo: Modulo }) {
  const eletrodos = modulo.eletrodos
  if (!eletrodos) return null
  return (
    <PaginaTecnica titulo="Eletrodos" fontes={eletrodos.fontes}>
      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Atlas de eletrodos</h3>
        <AtlasEletrodos modalidade={eletrodos.modalidade} base={`${modulo.base}/eletrodos`} />
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Como identificar cada eletrodo</h3>
        <ul className="tf-lista-simples">
          {eletrodos.identificacao.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Como colocar</h3>
        <ol className="tf-passos">
          {eletrodos.comoColocar.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ol>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Recomendações</h3>
        <ul className="tf-lista-simples">
          {eletrodos.recomendacoes.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha tf-cartao">
        <h3 className="tf-cartao__titulo">Especificação do fabricante</h3>
        <p className="tf-sub">
          Vale para o aparelho de referência (Neurodyn Portable TENS/FES) e não é faixa educativa. Confira sempre o manual do seu modelo.
        </p>
        <ul className="tf-lista-simples">
          {eletrodos.doFabricante.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      {eletrodos.materiais && <MateriaisDeApoio itens={eletrodos.materiais} />}
    </PaginaTecnica>
  )
}
