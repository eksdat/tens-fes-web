import type { ReactNode } from 'react'
import { IconeAtencao, IconeInfo, IconePerigo, IconeSucesso } from './Icones'

type Intencao = 'info' | 'atencao' | 'perigo' | 'sucesso'

const ICONES = { info: IconeInfo, atencao: IconeAtencao, perigo: IconePerigo, sucesso: IconeSucesso }

type Props = {
  intencao?: Intencao
  titulo: string
  children?: ReactNode
  /** Botão ou link de ação, abaixo do texto. */
  acao?: ReactNode
}

/** Ícone de forma própria + título em palavras: a intenção nunca depende só da cor. */
export function Alerta({ intencao = 'info', titulo, children, acao }: Props) {
  const Icone = ICONES[intencao]
  return (
    <div className={`tf-alert${intencao === 'info' ? '' : ` tf-alert--${intencao}`}`} role={intencao === 'perigo' ? 'alert' : 'status'}>
      <Icone />
      <div>
        <p className="tf-alert__titulo">{titulo}</p>
        {children && <p className="tf-alert__texto">{children}</p>}
        {acao && <div className="tf-alert__acao">{acao}</div>}
      </div>
    </div>
  )
}
