import type { ReactNode } from 'react'
import { IconePerigo } from './Icones'

/** Mensagem de erro de campo: ícone + a palavra "Erro", anunciada por leitores de tela. Nunca só cor. */
export function ErroDeCampo({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="tf-field__erro" role="alert">
      <IconePerigo />
      <span>
        <strong>Erro:</strong> {children}
      </span>
    </p>
  )
}
