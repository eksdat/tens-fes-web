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

/** Símbolo de acesso universal: figura de braços abertos dentro do círculo. */
export function IconeAcessibilidade(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path className="tf-icon__knock" d="M6.5 9.5c3.5 1 7.5 1 11 0M12 11v3.5M12 14.5l-2.5 4.5M12 14.5l2.5 4.5" />
      <circle cx="12" cy="6.6" r="1.4" fill="var(--icon-knock, var(--surface-200))" />
    </Base>
  )
}

export function IconeLupa(props: Props) {
  return (
    <Base {...props}>
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="m15.5 15.5 5 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </Base>
  )
}

export function IconeInicio(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 2.5 1.5 12H5v9.5h5.5V15h3v6.5H19V12h3.5z" />
    </Base>
  )
}

export function IconeTens(props: Props) {
  return (
    <Base {...props}>
      <path d="M1.5 12h5l2.5-7 5 14 2.5-7h6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  )
}

export function IconeFes(props: Props) {
  return (
    <Base {...props}>
      <path d="M13.5 1.5 4 13.5h6l-1.5 9 9.5-12h-6z" />
    </Base>
  )
}

export function IconeCriar(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path className="tf-icon__knock" d="M12 10v7M8.5 13.5h7" />
    </Base>
  )
}

export function IconePacientes(props: Props) {
  return (
    <Base {...props}>
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M2 20.5c0-4 3-6.5 7-6.5s7 2.5 7 6.5z" />
      <circle cx="17.5" cy="8.5" r="2.5" />
      <path d="M17.5 13.5c3 0 5 1.8 5 5.5h-4.2c0-2-.6-4-2-5.3z" />
    </Base>
  )
}

/** Senoide contínua: distingue o TENS do FES também pela forma (design system, seção 3.10). */
export function OndaTens(props: Props) {
  return (
    <Base {...props}>
      <path d="M1.5 12c2-9 4-9 5.25 0s3.25 9 5.25 0 4-9 5.25 0 3.25 9 5.25 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  )
}

/** Trem de pulsos com rampa. */
export function OndaFes(props: Props) {
  return (
    <Base {...props}>
      <path d="M1.5 19h2.5v-4h2.5v4h2.5v-7h2.5v7h2.5v-11h2.5v11H22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  )
}
