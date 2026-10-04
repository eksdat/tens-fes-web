import { createClient } from '@supabase/supabase-js'
import { armazenamentoDaSessao } from '../auth/armazenamento'

const url = import.meta.env.VITE_SUPABASE_URL
const chavePublica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !chavePublica) {
  throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env do frontend.')
}

/**
 * Cliente do Supabase. Uso restrito a `supabase.auth.*`: nunca from(), rpc(), storage ou realtime.
 * Dados do sistema passam sempre pela API (src/shared/api/client.ts).
 */
/** Para onde o Supabase devolve o usuário (link do e-mail e Google). Rota em app/router.tsx. */
export const urlDeRetornoAuth = () => `${window.location.origin}/auth/callback`

export const supabase = createClient(url, chavePublica, {
  auth: { storage: armazenamentoDaSessao, autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
})
