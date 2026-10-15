import { useId, useState } from 'react'
import { Link } from 'react-router'
import { IconePerigo } from './Icones'

export type ItemFaq = {
  pergunta: string
  /** Frase curta em destaque: a resposta em uma linha. */
  destaque: string
  detalhe?: string
  /** Só para respostas de segurança: a ação vem primeiro. */
  alerta?: { titulo: string; texto: string }
  acao?: { rotulo: string; para: string }
}

type Props = {
  itens: ItemFaq[]
  /** Âncora da seção "Fonte e data de revisão" da página. */
  fonteHref: string
}

/** Acordeão em gaveta do design system: a seta aponta para baixo fechada e gira para cima ao abrir. */
export function PerguntasFrequentes({ itens, fonteHref }: Props) {
  const id = useId()
  const [abertos, setAbertos] = useState(() => itens.map((_, i) => i === 0))

  function alternar(indice: number) {
    setAbertos((atual) => atual.map((aberto, i) => (i === indice ? !aberto : aberto)))
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLButtonElement>) {
    const botoes = [...(e.currentTarget.closest('ul')?.querySelectorAll<HTMLButtonElement>('.tf-acc__btn') ?? [])]
    const atual = botoes.indexOf(document.activeElement as HTMLButtonElement)
    if (atual < 0) return
    const destino = {
      ArrowDown: botoes[(atual + 1) % botoes.length],
      ArrowUp: botoes[(atual - 1 + botoes.length) % botoes.length],
      Home: botoes[0],
      End: botoes[botoes.length - 1],
    }[e.key]
    if (!destino) return
    e.preventDefault()
    destino.focus()
  }

  return (
    <ul className="tf-acc tf-acc--gaveta">
      {itens.map((item, i) => {
        const botao = `${id}-b${i}`
        const painel = `${id}-p${i}`
        return (
          <li key={item.pergunta} className="tf-acc__item" data-open={abertos[i]}>
            <h4 className="tf-acc__h">
              <button type="button" className="tf-acc__btn" id={botao} aria-expanded={abertos[i]} aria-controls={painel} onClick={() => alternar(i)} onKeyDown={aoTeclar}>
                <span>{item.pergunta}</span>
                <span className="tf-acc__ind" aria-hidden="true">
                  <svg viewBox="0 0 20 20" focusable="false">
                    <path d="M3 7l7 7 7-7" />
                  </svg>
                </span>
              </button>
            </h4>
            <section className="tf-acc__painel" id={painel} aria-labelledby={botao}>
              <div className="tf-acc__interno">
                <div className="tf-acc__corpo">
                  <p className="tf-faq__destaque">{item.destaque}</p>
                  {item.detalhe && <p className="tf-faq__texto">{item.detalhe}</p>}
                  {item.alerta && (
                    <div className="tf-alert tf-alert--perigo" role="note">
                      <IconePerigo />
                      <div>
                        <p className="tf-alert__titulo">{item.alerta.titulo}</p>
                        <p className="tf-alert__texto">{item.alerta.texto}</p>
                      </div>
                    </div>
                  )}
                  <div className="tf-faq__rodape">
                    {item.acao && (
                      <Link className="tf-link" to={item.acao.para}>
                        {item.acao.rotulo} <span aria-hidden="true">→</span>
                      </Link>
                    )}
                    <a className="tf-faq__fonte" href={fonteHref}>
                      Fonte e data de revisão
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </li>
        )
      })}
    </ul>
  )
}
