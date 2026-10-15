import type { ConteudoSeguranca } from '../seguranca/conteudoSeguranca'
import { PaginaTecnica } from './PaginaTecnica'

export function PaginaSeguranca({ dados }: { dados: ConteudoSeguranca }) {
  return (
    <PaginaTecnica titulo="Segurança" fontes={dados.fontes}>
      <p className="tf-sub">{dados.introducao}</p>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Antes da aplicação</h3>
        <ul className="tf-lista-cartoes">
          {dados.antes.map((item) => (
            <li key={item.situacao} className="tf-cartao tf-modo">
              <h4 className="tf-cartao__titulo">{item.situacao}</h4>
              <p className="tf-sub">{item.conduta}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Checklist antes de começar</h3>
        <ul className="tf-lista-simples">
          {dados.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Durante a aplicação</h3>
        {dados.durante.map((p) => (
          <p key={p} className="tf-sub">
            {p}
          </p>
        ))}
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Depois da aplicação</h3>
        {dados.depois.map((p) => (
          <p key={p} className="tf-sub">
            {p}
          </p>
        ))}
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Quando interromper ou revisar</h3>
        <dl className="tf-dados tf-gatilhos">
          {dados.gatilhos.map((g) => (
            <div key={g.gatilho} className="tf-gatilho">
              <dt>{g.gatilho}</dt>
              <dd>{g.mensagem}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Fora do escopo deste módulo</h3>
        <ul className="tf-lista-simples">
          {dados.foraDoEscopo.itens.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="tf-sub">{dados.foraDoEscopo.nota}</p>
      </section>
    </PaginaTecnica>
  )
}
