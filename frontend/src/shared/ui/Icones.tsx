/** Ícones sólidos 24x24. Decorativos (aria-hidden): o significado sempre vem junto em texto. */
type Props = { className?: string }

function Base({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg className={`tf-icon ${className ?? ''}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

export function IconeInfo(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path className="tf-icon__knock" d="M12 11v6M12 7.5v.01" />
    </Base>
  )
}

export function IconeAtencao(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 2.5 22.5 21h-21z" />
      <path className="tf-icon__knock" d="M12 9.5v5M12 17.5v.01" />
    </Base>
  )
}

export function IconePerigo(props: Props) {
  return (
    <Base {...props}>
      <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />
      <path className="tf-icon__knock" d="M12 7v6M12 16.5v.01" />
    </Base>
  )
}

export function IconeSucesso(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path className="tf-icon__knock" d="M7.5 12.5l3 3 6-7" />
    </Base>
  )
}

export function IconeOlho(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 5C6.5 5 3 9.5 1.8 12 3 14.5 6.5 19 12 19s9-4.5 10.2-7C21 9.5 17.5 5 12 5Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
      <circle cx="12" cy="12" r="2" />
    </Base>
  )
}

export function IconeEnvelope(props: Props) {
  return (
    <Base {...props}>
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path className="tf-icon__knock" d="m3 7 9 6.5L21 7" />
    </Base>
  )
}

export function IconePessoa(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
    </Base>
  )
}

export function IconeSeta(props: Props) {
  return (
    <Base {...props}>
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  )
}
