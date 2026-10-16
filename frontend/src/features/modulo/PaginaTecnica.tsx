import type { ReactNode } from 'react'
import type { Fonte } from './tipos'

type Props = { titulo: string; fontes?: Fonte[]; children: ReactNode }

/**
 * Página padrão de conteúdo técnico (Guia Técnico, seção 06): corpo da aba e, no fim, "Fonte e data de revisão".
 * A data só aparece quando a revisão docente existir; enquanto isso a página diz que está pendente.
 */
export function PaginaTecnica({ titulo, fontes = [], children }: Props) {
  return (
    <article className="tf-pilha tf-tecnica">
      <h2 className="tf-subtitulo">{titulo}</h2>
      {children}
      <footer id="fonte-revisao" className="tf-tecnica__rodape">
        <h3 className="tf-tecnica__titulo">Fonte e data de revisão</h3>
        {fontes.length > 0 && (
          <ul className="tf-tecnica__fontes">
            {fontes.map((fonte) => (
              <li key={fonte.codigo}>
                <span>
                  {fonte.codigo} · {fonte.referencia}{' '}
                </span>
                <a className="tf-link" href={fonte.url} target="_blank" rel="noopener noreferrer">
                  Abrir fonte<span className="tf-sr-only"> (abre em outra aba)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="tf-sub">Revisão docente: pendente.</p>
      </footer>
    </article>
  )
}
