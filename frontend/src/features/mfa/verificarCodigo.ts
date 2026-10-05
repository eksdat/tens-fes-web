import { supabase } from '../../shared/api/supabase'

export const MENSAGEM_CODIGO_ERRADO = 'Código incorreto ou vencido. Confira o aplicativo e tente de novo.'

/** Confirma o código do autenticador. Deu certo: o supabase-js troca a sessão por uma aal2 e avisa o AuthProvider. */
export async function verificarCodigo(fatorId: string, codigo: string): Promise<'ok' | 'codigo' | 'falha'> {
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fatorId, code: codigo })
  if (!error) return 'ok'
  return error.code === 'mfa_verification_failed' ? 'codigo' : 'falha'
}
