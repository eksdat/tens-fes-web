import type { ReactNode } from 'react'
import type { Fonte } from './tipos'

type Props = {
  titulo: string
  fontes?: Fonte[]
  /** Referências vindas da API que não são uma das fontes com link (ex.: "Guia técnico, seção 07"). */
  outrasReferencias?: string[]
  /** ISO (aaaa-mm-dd). Nulo ou ausente: revisão docente pendente. */
  dataRevisao?: string | null
  children: ReactNode
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

/**
 * Página padrão de conteúdo técnico (Guia Técnico, seção 06): corpo da aba e, no fim, "Fonte e data de revisão".
 */
export function PaginaTecnica({ titulo, fontes = [], outrasReferencias = [], dataRevisao, children }: Props) {
  return (
    <article className="tf-pilha tf-tecnica">
      <h2 className="tf-subtitulo">{titulo}</h2>
      {children}
      <footer id="fonte-revisao" className="tf-tecnica__rodape">
        <h3 className="tf-tecnica__titulo">Fonte e data de revisão</h3>
        {(fontes.length > 0 || outrasReferencias.length > 0) && (
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
            {outrasReferencias.map((referencia) => (
              <li key={referencia}>{referencia}</li>
            ))}
          </ul>
        )}
        <p className="tf-sub">
          {dataRevisao ? `Revisão docente: ${formatarData(dataRevisao)}.` : 'Revisão docente: pendente.'}
        </p>
      </footer>
    </article>
  )
}
