import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'

/**
 * Ícone "X" inline — decorativo, sem dependência extra de Icones.tsx.
 * aria-hidden porque o botão já tem aria-label.
 */
function IconeFechar() {
  return (
    <svg
      className="tf-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M6 6l12 12M6 18L18 6"
      />
    </svg>
  )
}

export type DialogoProps = {
  /** Elemento que abre o diálogo (trigger). */
  gatilho: ReactNode
  /** Título visível do diálogo — anuncia o contexto ao leitor de tela. */
  titulo: string
  /** Descrição opcional abaixo do título. */
  descricao?: string
  /** Conteúdo principal do diálogo. */
  children: ReactNode
  /** Botões de ação no rodapé. */
  acoes?: ReactNode
  /** Estado controlado — se undefined, o componente gerencia o próprio estado. */
  aberto?: boolean
  /** Callback ao tentar fechar (ESC, clique na overlay ou botão X). */
  aoFechar?: () => void
}

/**
 * Diálogo acessível construído sobre o Radix UI Dialog.
 *
 * - Captura o foco ao abrir e o devolve ao gatilho ao fechar.
 * - ESC fecha o diálogo.
 * - Título em `<h2>` ligado ao painel via `aria-labelledby`.
 * - Descrição opcional ligada via `aria-describedby`.
 * - Overlay bloqueia interação com o fundo.
 * - Animação respeita `prefers-reduced-motion` via `base.css`.
 *
 * Contraste do overlay: rgba(11,31,21,0.6) — suficiente para indicar estado modal
 * sem depender só da cor (o foco é capturado e o restante da página fica inerte).
 */
export function Dialogo({
  gatilho,
  titulo,
  descricao,
  children,
  acoes,
  aberto,
  aoFechar,
}: DialogoProps) {
  const controlado = aberto !== undefined

  return (
    <Dialog.Root
      open={controlado ? aberto : undefined}
      onOpenChange={controlado ? (v) => { if (!v) aoFechar?.() } : undefined}
      modal
    >
      <Dialog.Trigger asChild>{gatilho}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="tf-dialogo-overlay" />

        <Dialog.Content className="tf-dialogo" aria-modal="true">
          <div className="tf-dialogo__painel">
            <header className="tf-dialogo__cabecalho">
              <Dialog.Title className="tf-dialogo__titulo">{titulo}</Dialog.Title>
              <Dialog.Close
                className="tf-dialogo__fechar"
                aria-label="Fechar diálogo"
                onClick={aoFechar}
              >
                <IconeFechar />
              </Dialog.Close>
            </header>

            {descricao && (
              <Dialog.Description className="tf-dialogo__descricao">
                {descricao}
              </Dialog.Description>
            )}

            <div className="tf-dialogo__corpo">{children}</div>

            {acoes && <div className="tf-dialogo__rodape">{acoes}</div>}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
