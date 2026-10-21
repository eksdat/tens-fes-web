/**
 * Token no formato JWT (cabeçalho.dados.assinatura). A tela só lê os dados (aal, sub, exp); ninguém confere a
 * assinatura aqui, então ela é só um texto fixo.
 */
export type DadosDoToken = {
  sub: string
  email: string
  aal: 'aal1' | 'aal2'
  exp: number
}

const base64url = (valor: object) => Buffer.from(JSON.stringify(valor)).toString('base64url')

export function criarToken(dados: DadosDoToken): string {
  const agora = Math.floor(Date.now() / 1000)
  const completo = {
    ...dados,
    aud: 'authenticated',
    role: 'authenticated',
    iat: agora,
    session_id: `sessao-${dados.sub}`,
    amr: [{ method: dados.aal === 'aal2' ? 'totp' : 'password', timestamp: agora }],
  }
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(completo)}.assinatura-de-teste`
}

/** Lê o "Bearer ..." do cabeçalho Authorization. Sem token ou com token estranho: null. */
export function lerToken(authorization: string | undefined): DadosDoToken | null {
  const token = authorization?.replace(/^Bearer /, '')
  const dados = token?.split('.')[1]
  if (!dados) return null
  try {
    return JSON.parse(Buffer.from(dados, 'base64url').toString()) as DadosDoToken
  } catch {
    return null
  }
}
