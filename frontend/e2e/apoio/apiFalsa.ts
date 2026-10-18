import type { Page, Route } from '@playwright/test'
import { FAIXAS, paginaAprovada, type Conta } from './dados'
import { URL_API } from './enderecos'
import { lerCorpo, liberarPreflight, responder } from './http'
import type { SupabaseFalso } from './supabaseFalso'

/** Só os campos que a API falsa usa têm tipo; o resto do corpo é guardado como veio. */
type Corpo<T> = T & { [campo: string]: unknown }
type DadosPaciente = Corpo<{ nome: string; sobrenome: string; identificador: string }>
type DadosAvaliacao = Corpo<{ dataAvaliacao: string }>
type DadosSessao = Corpo<{ dataHora: string }>
type Paciente = DadosPaciente & { id: string; profissionalId: string }
type Avaliacao = DadosAvaliacao & { id: string; pacienteId: string }
type Sessao = DadosSessao & { id: string; pacienteId: string }

const agora = () => new Date().toISOString()

/**
 * Faz o papel do backend (/api/v1) com as mesmas regras de acesso: sem token, 401; paciente, avaliação e sessão só
 * para PROFISSIONAL (403) e só os pacientes do próprio profissional. Tudo em memória, um estado por teste.
 */
export class ApiFalsa {
  readonly pacientes: Paciente[] = []
  readonly avaliacoes: Avaliacao[] = []
  readonly sessoes: Sessao[] = []
  /** Chamadas que este falso não sabe responder. O teste falha se sobrar alguma. */
  readonly naoAtendidas: string[] = []
  private readonly paginasAprovadas = new Set<string>()
  private readonly supabase: SupabaseFalso

  constructor(supabase: SupabaseFalso) {
    this.supabase = supabase
  }

  /** Simula a revisão docente concluída para uma aba do módulo. */
  aprovarPagina(modalidade: string, secao: string) {
    this.paginasAprovadas.add(`${modalidade}/${secao}`)
  }

  /** Paciente que o profissional já tinha cadastrado antes do teste. */
  adicionarPaciente(profissional: Conta, dados: { nome: string; sobrenome: string; identificador: string; dataNascimento: string }) {
    const carimbo = { criadoEm: agora(), criadoPor: profissional.id, alteradoEm: agora(), alteradoPor: profissional.id }
    this.pacientes.push({ ...dados, ...carimbo, email: null, id: crypto.randomUUID(), profissionalId: profissional.id })
  }

  async ligar(page: Page) {
    await page.route(`${URL_API}/**`, (route) => this.atender(route))
  }

  private async atender(route: Route) {
    const pedido = route.request()
    if (pedido.method() === 'OPTIONS') return liberarPreflight(route)

    const url = new URL(pedido.url())
    const caminho = url.pathname.replace('/api/v1', '')
    const rota = `${pedido.method()} ${caminho}`
    const conta = this.supabase.contaDoToken(pedido.headers().authorization)
    if (!conta) return this.problema(route, 401, 'Não autenticado.')

    if (rota === 'GET /usuarios/me') {
      return conta.semCadastro ? this.problema(route, 404, 'Cadastro não encontrado.') : responder(route, 200, usuarioDaApi(conta))
    }
    if (rota === 'POST /usuarios/me') return this.cadastrar(route, conta)
    if (rota === 'GET /conteudos/pagina') return this.pagina(route, url.searchParams)
    if (rota === 'GET /parametros/faixas') return responder(route, 200, FAIXAS[url.searchParams.get('modalidade') ?? ''] ?? [])

    if (caminho.startsWith('/pacientes')) {
      // Mesma barreira do SecurityConfig: estudante não entra em /pacientes/**.
      if (conta.perfil !== 'PROFISSIONAL' || conta.semCadastro) return this.problema(route, 403, 'Acesso negado.')
      return this.pacientesDe(route, conta, caminho, url.searchParams)
    }

    return this.naoSimulada(route, rota)
  }

  private cadastrar(route: Route, conta: Conta) {
    const corpo = lerCorpo(route)
    if (!conta.semCadastro) return this.problema(route, 409, 'Cadastro já concluído.')
    if (corpo.aceiteTermos !== true) {
      return this.problema(route, 400, 'Dados inválidos.', { aceiteTermos: 'Aceite os termos de uso.' })
    }
    Object.assign(conta, corpo, { semCadastro: false })
    return responder(route, 201, usuarioDaApi(conta))
  }

  private pagina(route: Route, params: URLSearchParams) {
    const modalidade = params.get('modalidade') ?? ''
    const secao = params.get('secao') ?? ''
    if (this.paginasAprovadas.has(`${modalidade}/${secao}`)) return responder(route, 200, paginaAprovada(modalidade, secao))
    return responder(route, 200, { modalidade, secao, liberada: false, blocos: [], referencias: [], dataRevisao: null })
  }

  private pacientesDe(route: Route, conta: Conta, caminho: string, params: URLSearchParams) {
    const metodo = route.request().method()
    const partes = caminho.split('/').filter(Boolean) // ['pacientes', id?, 'avaliacoes' | 'sessoes'?, id?]
    const meus = this.pacientes.filter((p) => p.profissionalId === conta.id)

    if (partes.length === 1 && metodo === 'GET') return responder(route, 200, listar(meus, params))
    if (partes.length === 1 && metodo === 'POST') return this.salvarPaciente(route, conta, meus)

    const paciente = meus.find((p) => p.id === partes[1])
    if (!paciente) return this.problema(route, 404, 'Paciente não encontrado.')

    if (partes.length === 2 && metodo === 'GET') return responder(route, 200, paciente)
    if (partes.length === 2 && metodo === 'PUT') return this.salvarPaciente(route, conta, meus, paciente)
    if (partes.length === 2 && metodo === 'DELETE') {
      this.pacientes.splice(this.pacientes.indexOf(paciente), 1)
      return responder(route, 204)
    }

    if (partes[2] === 'avaliacoes') return this.avaliacoesDe(route, conta, paciente, partes[3], params)
    if (partes[2] === 'sessoes') return this.sessoesDe(route, conta, paciente)
    return this.naoSimulada(route, `${metodo} ${caminho}`)
  }

  private salvarPaciente(route: Route, conta: Conta, meus: Paciente[], existente?: Paciente) {
    const corpo = lerCorpo<DadosPaciente>(route)
    const repetido = meus.some((p) => p.identificador === corpo.identificador && p.id !== existente?.id)
    if (repetido) return this.problema(route, 409, 'Você já tem um paciente com este identificador.')

    const carimbo = { alteradoEm: agora(), alteradoPor: conta.id }
    if (existente) {
      Object.assign(existente, corpo, carimbo)
      return responder(route, 200, existente)
    }
    const novo: Paciente = {
      ...corpo,
      ...carimbo,
      id: crypto.randomUUID(),
      profissionalId: conta.id,
      criadoEm: agora(),
      criadoPor: conta.id,
    }
    this.pacientes.push(novo)
    return responder(route, 201, novo)
  }

  private avaliacoesDe(route: Route, conta: Conta, paciente: Paciente, id: string | undefined, params: URLSearchParams) {
    const metodo = route.request().method()
    const doPaciente = this.avaliacoes.filter((a) => a.pacienteId === paciente.id)

    if (!id && metodo === 'GET') {
      const ordem = [...doPaciente].sort((a, b) => a.dataAvaliacao.localeCompare(b.dataAvaliacao))
      return responder(route, 200, params.get('direcao') === 'asc' ? ordem : ordem.reverse())
    }
    if (!id && metodo === 'POST') {
      const nova: Avaliacao = {
        ...lerCorpo<DadosAvaliacao>(route),
        id: crypto.randomUUID(),
        pacienteId: paciente.id,
        criadoEm: agora(),
        criadoPor: conta.id,
        alteradoEm: agora(),
        alteradoPor: conta.id,
      }
      this.avaliacoes.push(nova)
      return responder(route, 201, nova)
    }

    const avaliacao = doPaciente.find((a) => a.id === id)
    if (!avaliacao) return this.problema(route, 404, 'Avaliação não encontrada.')
    if (metodo === 'GET') return responder(route, 200, avaliacao)
    if (metodo === 'PUT') {
      Object.assign(avaliacao, lerCorpo(route), { alteradoEm: agora(), alteradoPor: conta.id })
      return responder(route, 200, avaliacao)
    }
    return this.naoSimulada(route, `${metodo} avaliação`)
  }

  private sessoesDe(route: Route, conta: Conta, paciente: Paciente) {
    const metodo = route.request().method()
    if (metodo === 'GET') {
      const doPaciente = this.sessoes.filter((s) => s.pacienteId === paciente.id)
      return responder(route, 200, doPaciente.sort((a, b) => b.dataHora.localeCompare(a.dataHora)))
    }
    if (metodo === 'POST') {
      const nova: Sessao = {
        ...lerCorpo<DadosSessao>(route),
        id: crypto.randomUUID(),
        pacienteId: paciente.id,
        profissionalId: conta.id,
        criadoEm: agora(),
      }
      this.sessoes.push(nova)
      return responder(route, 201, nova)
    }
    return this.naoSimulada(route, `${metodo} sessão`)
  }

  /** Mesmo formato do GlobalExceptionHandler (ProblemDetail, com "erros" por campo quando houver). */
  private problema(route: Route, status: number, detalhe: string, erros?: Record<string, string>) {
    return responder(route, status, { status, detail: detalhe, ...(erros ? { erros } : {}) })
  }

  private naoSimulada(route: Route, rota: string) {
    this.naoAtendidas.push(`API: ${rota}`)
    return this.problema(route, 501, `Sem resposta no teste para ${rota}`)
  }
}

function usuarioDaApi(conta: Conta) {
  const { id, nome, perfil, instituicao, periodo, categoria, registro, uf } = conta
  return { id, nome, perfil, revisor: false, instituicao, periodo, categoria, registro, uf, termosPendentes: false }
}

/** Página de pacientes com busca por nome ou identificador, ordenada pela coluna pedida. */
function listar(pacientes: Paciente[], params: URLSearchParams) {
  const busca = (params.get('busca') ?? '').toLowerCase()
  const coluna = params.get('ordenar') ?? 'nome'
  const tamanho = Number(params.get('tamanho') ?? 20)
  const pagina = Number(params.get('pagina') ?? 0)
  const achados = pacientes
    .filter((p) => `${p.nome} ${p.sobrenome} ${p.identificador}`.toLowerCase().includes(busca))
    .sort((a, b) => String(a[coluna]).localeCompare(String(b[coluna])))
  if (params.get('direcao') === 'desc') achados.reverse()
  return {
    itens: achados.slice(pagina * tamanho, (pagina + 1) * tamanho),
    pagina,
    tamanho,
    totalItens: achados.length,
    totalPaginas: Math.ceil(achados.length / tamanho),
  }
}
