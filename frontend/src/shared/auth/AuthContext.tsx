import { createContext, useState, type ReactNode } from 'react'
import { lerSessaoSalva, limparSessaoSalva, salvarSessao, type Sessao } from './sessaoStorage'

type AuthContextValue = {
  sessao: Sessao | null
  entrar: (sessao: Sessao) => void
  sair: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessaoSalva)

  function entrar(nova: Sessao) {
    salvarSessao(nova)
    setSessao(nova)
  }

  function sair() {
    limparSessaoSalva()
    setSessao(null)
  }

  return <AuthContext value={{ sessao, entrar, sair }}>{children}</AuthContext>
}
