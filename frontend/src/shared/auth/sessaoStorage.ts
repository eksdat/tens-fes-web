export type Perfil = 'ESTUDANTE' | 'PROFISSIONAL'

export type Sessao = {
  token: string
  nome: string
  perfil: Perfil
}

const CHAVE = 'tensfes.sessao'

export function lerSessaoSalva(): Sessao | null {
  const salvo = localStorage.getItem(CHAVE)
  return salvo ? (JSON.parse(salvo) as Sessao) : null
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem(CHAVE, JSON.stringify(sessao))
}

export function tokenSalvo(): string | null {
  return lerSessaoSalva()?.token ?? null
}

export function limparSessaoSalva() {
  localStorage.removeItem(CHAVE)
}
