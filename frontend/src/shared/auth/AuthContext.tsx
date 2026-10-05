import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../api/supabase'
import { AuthContext } from './contexto'

/** Reflete a sessão do Supabase Auth. O perfil NÃO vem daqui: vem de GET /usuarios/me. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento, nova) => {
      setSessao(nova)
      setCarregando(false)
      if (evento === 'SIGNED_OUT') queryClient.clear()
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  async function sair() {
    await supabase.auth.signOut()
  }

  return <AuthContext value={{ sessao, carregando, sair }}>{children}</AuthContext>
}
