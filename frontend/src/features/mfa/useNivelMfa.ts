import type { Session } from '@supabase/supabase-js'
import { useMemo } from 'react'
import { useAuth } from '../../shared/auth/useAuth'

export type Aal = 'aal1' | 'aal2'

export type NivelMfa = {
  /** Nível da sessão atual (claim `aal` do token). */
  atual: Aal
  /** aal2 quando a conta tem autenticador verificado: a sessão precisa subir até lá. */
  proximo: Aal
  fatorId?: string
}

function aalDoToken(token: string): Aal {
  const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const { aal } = JSON.parse(atob(parte.padEnd(Math.ceil(parte.length / 4) * 4, '='))) as { aal?: Aal }
  return aal === 'aal2' ? 'aal2' : 'aal1'
}

/**
 * Lido da própria sessão, sem rede: o AuthProvider já recebe cada mudança (código verificado, token renovado).
 * Mesma conta que o getAuthenticatorAssuranceLevel do supabase-js faz.
 */
export function nivelDaSessao(sessao: Session): NivelMfa {
  const fator = sessao.user.factors?.find((f) => f.factor_type === 'totp' && f.status === 'verified')
  return { atual: aalDoToken(sessao.access_token), proximo: fator ? 'aal2' : 'aal1', fatorId: fator?.id }
}

export function useNivelMfa(): NivelMfa | null {
  const { sessao } = useAuth()
  return useMemo(() => (sessao ? nivelDaSessao(sessao) : null), [sessao])
}
