import type { Material } from './tipos'

/** Links para conteúdo de terceiros. Não fazem parte do texto revisado do módulo e abrem em outra aba. */
export function MateriaisDeApoio({ itens }: { itens: Material[] }) {
  return (
    <section className="tf-pilha">
      <h3 className="tf-subtitulo">Materiais de apoio</h3>
      <p className="tf-sub">Vídeos de outros autores, ainda sem revisão docente. Não substituem o conteúdo deste módulo.</p>
      <ul className="tf-lista-simples">
        {itens.map((item) => (
          <li key={item.url}>
            <a className="tf-link" href={item.url} target="_blank" rel="noopener noreferrer">
              {item.titulo}
              <span className="tf-sr-only"> (abre em outra aba)</span>
            </a>
            <span className="tf-sub">
              {' '}
              · {item.canal} · {item.formato}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
