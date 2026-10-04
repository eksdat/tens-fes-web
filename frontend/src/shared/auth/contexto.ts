import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'

export type AuthContextValue = {
  sessao: Session | null
  /** true até o Supabase informar se há sessão (leitura do armazenamento ou do link do e-mail). */
  carregando: boolean
  sair: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
