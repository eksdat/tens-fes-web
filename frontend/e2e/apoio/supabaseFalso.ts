import type { Page, Route } from '@playwright/test'
import { CODIGO_AUTENTICADOR, type Conta } from './dados'
import { URL_SUPABASE } from './enderecos'
import { lerCorpo, liberarPreflight, responder } from './http'
import { criarToken, lerToken } from './token'

const DURACAO_SESSAO = 3600
const CRIADO_EM = '2026-10-01T12:00:00Z'

/**
 * Faz o papel do Supabase Auth (só /auth/v1). Guarda as contas em memória: cada teste começa com as dele e o que
 * um teste cria não aparece no outro.
 */
export class SupabaseFalso {
  private readonly contas: Conta[] = []
  private readonly confirmadas = new Set<string>()
  /** Pedidos de criação de conta recebidos (POST /signup), na ordem. */
  readonly cadastrosRecebidos: { email: string; dados: Record<string, unknown> }[] = []
  /** Chamadas que este falso não sabe responder. O teste falha se sobrar alguma. */
  readonly naoAtendidas: string[] = []

  /** Contas que já existem e já confirmaram o e-mail. Cópia: o teste pode mudar sem afetar os outros. */
  adicionar(...contas: Conta[]) {
    for (const conta of contas) {
      this.contas.push(structuredClone(conta))
      this.confirmadas.add(conta.email)
    }
  }

  conta(id: string): Conta | undefined {
    return this.contas.find((c) => c.id === id)
  }

  /** Conta dona do token do cabeçalho Authorization. */
  contaDoToken(authorization: string | undefined): Conta | undefined {
    const dados = lerToken(authorization)
    return dados && dados.exp > Date.now() / 1000 ? this.conta(dados.sub) : undefined
  }

  /** Confirma o e-mail e devolve o endereço do link que o Supabase mandaria (volta para /auth/callback). */
  linkDeConfirmacao(email: string): string {
    const conta = this.contas.find((c) => c.email === email)
    if (!conta) throw new Error(`Nenhum cadastro recebido para ${email}`)
    this.confirmadas.add(email)
    const sessao = this.sessao(conta, 'aal1')
    const hash = new URLSearchParams({
      access_token: sessao.access_token,
      refresh_token: sessao.refresh_token,
      expires_in: String(DURACAO_SESSAO),
      expires_at: String(sessao.expires_at),
      token_type: 'bearer',
      type: 'signup',
    })
    return `/auth/callback#${hash}`
  }

  async ligar(page: Page) {
    await page.route(`${URL_SUPABASE}/auth/v1/**`, (route) => this.atender(route))
  }

  private async atender(route: Route) {
    const pedido = route.request()
    if (pedido.method() === 'OPTIONS') return liberarPreflight(route)

    const url = new URL(pedido.url())
    const caminho = url.pathname.replace('/auth/v1', '')
    const rota = `${pedido.method()} ${caminho}`
    const corpo = lerCorpo(route)

    if (rota === 'POST /token' && url.searchParams.get('grant_type') === 'password') return this.entrar(route, corpo)
    if (rota === 'POST /token' && url.searchParams.get('grant_type') === 'refresh_token') return this.renovar(route, corpo)
    if (rota === 'POST /signup') return this.criarConta(route, corpo)
    if (rota === 'POST /logout') return responder(route, 204)
    if (rota === 'GET /user') {
      const conta = this.contaDoToken(pedido.headers().authorization)
      return conta ? responder(route, 200, this.usuario(conta)) : this.erro(route, 401, 'bad_jwt', 'Token inválido')
    }

    const fator = caminho.match(/^\/factors\/([^/]+)\/(challenge|verify)$/)
    if (fator && pedido.method() === 'POST') return this.autenticador(route, fator[2], corpo)

    this.naoAtendidas.push(`Supabase: ${rota}`)
    return this.erro(route, 501, 'nao_simulado', `Sem resposta no teste para ${rota}`)
  }

  private entrar(route: Route, corpo: Record<string, unknown>) {
    const conta = this.contas.find((c) => c.email === corpo.email)
    if (!conta || conta.senha !== corpo.password) {
      return this.erro(route, 400, 'invalid_credentials', 'Invalid login credentials')
    }
    if (!this.confirmadas.has(conta.email)) return this.erro(route, 400, 'email_not_confirmed', 'Email not confirmed')
    return responder(route, 200, this.sessao(conta, 'aal1'))
  }

  private renovar(route: Route, corpo: Record<string, unknown>) {
    const [, id, aal] = String(corpo.refresh_token).split(':')
    const conta = this.conta(id)
    if (!conta) return this.erro(route, 400, 'refresh_token_not_found', 'Invalid Refresh Token')
    return responder(route, 200, this.sessao(conta, aal === 'aal2' ? 'aal2' : 'aal1'))
  }

  /** Com confirmação de e-mail ligada, o Supabase devolve só o usuário, sem sessão. */
  private criarConta(route: Route, corpo: Record<string, unknown>) {
    const email = String(corpo.email)
    const dados = (corpo.data ?? {}) as Record<string, unknown>
    this.cadastrosRecebidos.push({ email, dados })
    const cadastro = (dados.cadastro ?? {}) as { nome?: string; perfil?: Conta['perfil'] }
    const conta: Conta = {
      id: crypto.randomUUID(),
      email,
      senha: String(corpo.password),
      nome: cadastro.nome ?? '',
      perfil: cadastro.perfil ?? 'ESTUDANTE',
      semCadastro: true,
      cadastroGuardado: dados.cadastro as Record<string, unknown> | undefined,
    }
    this.contas.push(conta)
    return responder(route, 200, { ...this.usuario(conta), email_confirmed_at: null, confirmation_sent_at: CRIADO_EM })
  }

  private autenticador(route: Route, etapa: string, corpo: Record<string, unknown>) {
    const conta = this.contaDoToken(route.request().headers().authorization)
    if (!conta) return this.erro(route, 401, 'bad_jwt', 'Token inválido')
    if (etapa === 'challenge') {
      return responder(route, 200, { id: 'desafio-1', type: 'totp', expires_at: Math.floor(Date.now() / 1000) + 300 })
    }
    if (corpo.code !== CODIGO_AUTENTICADOR) {
      return this.erro(route, 422, 'mfa_verification_failed', 'Invalid TOTP code entered')
    }
    return responder(route, 200, this.sessao(conta, 'aal2'))
  }

  private sessao(conta: Conta, aal: 'aal1' | 'aal2') {
    const expiraEm = Math.floor(Date.now() / 1000) + DURACAO_SESSAO
    return {
      access_token: criarToken({ sub: conta.id, email: conta.email, aal, exp: expiraEm }),
      token_type: 'bearer',
      expires_in: DURACAO_SESSAO,
      expires_at: expiraEm,
      refresh_token: `renovar:${conta.id}:${aal}`,
      user: this.usuario(conta),
    }
  }

  private usuario(conta: Conta) {
    return {
      id: conta.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: conta.email,
      email_confirmed_at: CRIADO_EM,
      phone: '',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: conta.cadastroGuardado ? { cadastro: conta.cadastroGuardado } : {},
      identities: [],
      factors: conta.autenticador
        ? [{ id: `fator-${conta.id}`, factor_type: 'totp', status: 'verified', friendly_name: 'Celular', created_at: CRIADO_EM, updated_at: CRIADO_EM }]
        : [],
      created_at: CRIADO_EM,
      updated_at: CRIADO_EM,
    }
  }

  private erro(route: Route, status: number, codigo: string, mensagem: string) {
    return responder(route, status, { code: status, error_code: codigo, msg: mensagem })
  }
}
