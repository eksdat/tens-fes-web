import { useCallback, useState } from 'react'
import { CampoCaptcha } from './CampoCaptcha'

export const MENSAGEM_CAPTCHA = 'Aguarde a verificação de segurança terminar e tente de novo.'

/**
 * CAPTCHA do Cloudflare Turnstile. Sem VITE_TURNSTILE_SITE_KEY fica desligado (campo some e `ativo` é false).
 * O token vale para uma única chamada ao Supabase: depois de usar, chame `renovar()` para pedir outro.
 */
export function useCaptcha() {
  const chave = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const [token, setToken] = useState<string | null>(null)
  const [rodada, setRodada] = useState(0)

  const renovar = useCallback(() => {
    setToken(null)
    setRodada((n) => n + 1)
  }, [])

  return {
    ativo: !!chave,
    token: token ?? undefined,
    renovar,
    campo: chave ? <CampoCaptcha key={rodada} chave={chave} aoMudar={setToken} /> : null,
  }
}
