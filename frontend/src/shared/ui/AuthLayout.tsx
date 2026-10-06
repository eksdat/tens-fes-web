import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { FolhasDecorativas } from './FolhasDecorativas'
import { Marca } from './Marca'

type Props = {
  /** Chamada curta acima do título do painel (caixa alta). */
  kicker: string
  /** Título de destaque do painel verde. Não é o h1: o h1 da tela fica dentro do cartão. */
  titulo: string
  texto: string
  /** No celular, mostra o painel como faixa no topo (login). Sem isso, só cabeçalho com marca e "Voltar". */
  faixa?: boolean
  voltarPara?: string
  /** Alternativa a voltarPara quando "Voltar" é uma ação da própria tela (ex.: etapa anterior do cadastro). */
  aoVoltar?: () => void
  children: ReactNode
}

export function AuthLayout({ kicker, titulo, texto, faixa = false, voltarPara, aoVoltar, children }: Props) {
  return (
    <div className={`tf-auth${faixa ? ' tf-auth--faixa' : ''}`}>
      <header className="tf-auth__topo">
        {voltarPara ? (
          <Link className="tf-link tf-auth__voltar" to={voltarPara}>
            <span aria-hidden="true">‹&nbsp;</span>Voltar
          </Link>
        ) : aoVoltar ? (
          <button type="button" className="tf-link tf-auth__voltar tf-botao-link" onClick={aoVoltar}>
            <span aria-hidden="true">‹&nbsp;</span>Voltar
          </button>
        ) : (
          <span />
        )}
        <Marca />
      </header>

      <aside className="tf-auth__painel tf-on-deep">
        <FolhasDecorativas className="tf-auth__arte" />
        <Marca />
        <div className="tf-auth__texto">
          <p className="tf-auth__kicker">{kicker}</p>
          <p className="tf-auth__painel-titulo">{titulo}</p>
          <p className="tf-auth__painel-texto">{texto}</p>
        </div>
        <p className="tf-auth__nota">
          Ambiente educativo. Os ajustes aqui não acionam equipamentos nem geram prescrição automática.
        </p>
      </aside>

      <main id="conteudo" tabIndex={-1} className="tf-auth__conteudo">
        <div className="tf-auth__cartao">{children}</div>
      </main>
    </div>
  )
}
