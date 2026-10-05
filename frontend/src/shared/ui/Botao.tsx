import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variante = 'primario' | 'secundario' | 'ghost'

function classes(variante: Variante, bloco?: boolean) {
  return `tf-btn tf-btn--${variante}${bloco ? ' tf-btn--bloco' : ''}`
}

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  bloco?: boolean
  /** Desabilita o botão e avisa leitores de tela que há uma operação em andamento. */
  carregando?: boolean
}

export function Botao({ variante = 'primario', bloco, carregando, disabled, type = 'button', ...resto }: BotaoProps) {
  return (
    <button
      type={type}
      className={classes(variante, bloco)}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    />
  )
}

type BotaoLinkProps = LinkProps & { variante?: Variante; bloco?: boolean }

export function BotaoLink({ variante = 'secundario', bloco, ...resto }: BotaoLinkProps) {
  return <Link className={classes(variante, bloco)} {...resto} />
}
