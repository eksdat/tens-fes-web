export type TamanhoTexto = 'normal' | 'grande' | 'muito-grande'

export type Preferencias = {
  tamanho: TamanhoTexto
  altoContraste: boolean
  semMovimento: boolean
}

export const PADRAO: Preferencias = { tamanho: 'normal', altoContraste: false, semMovimento: false }

const CHAVE = 'fisiotech.acessibilidade'

/** Todo texto está em rem: mudar o tamanho da raiz escala o app inteiro (WCAG 1.4.4). */
const ESCALA: Record<TamanhoTexto, string> = { normal: '100%', grande: '125%', 'muito-grande': '150%' }

function doSistema(): Preferencias {
  const ativo = (consulta: string) => window.matchMedia?.(consulta).matches ?? false
  return {
    ...PADRAO,
    altoContraste: ativo('(prefers-contrast: more)'),
    semMovimento: ativo('(prefers-reduced-motion: reduce)'),
  }
}

/** Sem escolha salva, vale a preferência do sistema operacional. Armazenamento pode falhar (janela privada). */
export function lerPreferencias(): Preferencias {
  const base = doSistema()
  try {
    const salvo: unknown = JSON.parse(localStorage.getItem(CHAVE) ?? 'null')
    if (typeof salvo !== 'object' || salvo === null) return base
    const { tamanho, altoContraste, semMovimento } = salvo as Record<string, unknown>
    return {
      tamanho: typeof tamanho === 'string' && tamanho in ESCALA ? (tamanho as TamanhoTexto) : base.tamanho,
      altoContraste: typeof altoContraste === 'boolean' ? altoContraste : base.altoContraste,
      semMovimento: typeof semMovimento === 'boolean' ? semMovimento : base.semMovimento,
    }
  } catch {
    return base
  }
}

export function salvarPreferencias(preferencias: Preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias))
  } catch {
    // Sem armazenamento a escolha vale só até recarregar a página.
  }
}

export function aplicarPreferencias({ tamanho, altoContraste, semMovimento }: Preferencias) {
  const raiz = document.documentElement
  raiz.style.fontSize = ESCALA[tamanho]
  if (altoContraste) raiz.dataset.contraste = 'alto'
  else delete raiz.dataset.contraste
  if (semMovimento) raiz.dataset.movimento = 'reduzido'
  else delete raiz.dataset.movimento
}
