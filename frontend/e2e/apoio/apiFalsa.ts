import type { Page, Route } from '@playwright/test'
import { conteudosIniciais, FAIXAS, type Conta, type ConteudoFalso } from './dados'
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

/** Data de hoje em Brasília (aaaa-mm-dd), como o RelogioConfig do backend. */
const hojeEmBrasilia = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())

const ORDEM = {
  modalidade: ['TENS', 'NMES', 'FES'],
  secao: ['VISAO_GERAL', 'APARELHO', 'ELETRODOS', 'PARAMETROS', 'SEGURANCA', 'CASOS'],
  bloco: ['O_QUE_E', 'PARA_QUE_SERVE', 'COMO_INTERPRETAR', 'EXEMPLO', 'CUIDADOS', null],
}

/** Mesma ordem do site (RevisaoConteudoService): módulo, aba, bloco (sem bloco por último) e id. */
const ordemDoSite = (a: ConteudoFalso, b: ConteudoFalso) =>
  ORDEM.modalidade.indexOf(a.modalidade) - ORDEM.modalidade.indexOf(b.modalidade) ||
  ORDEM.secao.indexOf(a.secao) - ORDEM.secao.indexOf(b.secao) ||
  ORDEM.bloco.indexOf(a.bloco) - ORDEM.bloco.indexOf(b.bloco) ||
  a.id - b.id

/**
 * Faz o papel do backend (/api/v1) com as mesmas regras de acesso: sem token, 401; paciente, avaliação e sessão só
 * para PROFISSIONAL (403) e só os pacientes do próprio profissional; revisão só para REVISOR. Tudo em memória, um
 * estado por teste.
 */
export class ApiFalsa {
  readonly pacientes: Paciente[] = []
  readonly avaliacoes: Avaliacao[] = []
  readonly sessoes: Sessao[] = []
  readonly conteudos: ConteudoFalso[] = conteudosIniciais()
  /** Chamadas que este falso não sabe responder. O teste falha se sobrar alguma. */
  readonly naoAtendidas: string[] = []
  private readonly supabase: SupabaseFalso

  constructor(supabase: SupabaseFalso) {
    this.supabase = supabase
  }

  /** Simula a revisão docente concluída para uma aba do módulo: os cinco blocos aprovados em 15/10/2026. */
  aprovarPagina(modalidade: string, secao: string) {
    for (const c of this.blocosDaPagina(modalidade, secao)) {
      Object.assign(c, { estado: 'APROVADO', dataRevisao: '2026-10-15' })
    }
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

    if (caminho.startsWith('/revisao/conteudos')) {
      // Mesma barreira do SecurityConfig: só REVISOR (docente).
      if (!conta.revisor) return this.problema(route, 403, 'Acesso negado.')
      return this.revisao(route, caminho)
    }

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

  private blocosDaPagina(modalidade: string, secao: string) {
    return this.conteudos.filter((c) => c.modalidade === modalidade && c.secao === secao && c.bloco)
  }

  /** Igual ao ConteudoService.paginaTecnica: só abre com os cinco blocos aprovados. */
  private pagina(route: Route, params: URLSearchParams) {
    const modalidade = params.get('modalidade') ?? ''
    const secao = params.get('secao') ?? ''
    const blocos = this.blocosDaPagina(modalidade, secao).sort(ordemDoSite)
    if (blocos.length !== 5 || blocos.some((c) => c.estado !== 'APROVADO')) {
      return responder(route, 200, { modalidade, secao, liberada: false, blocos: [], referencias: [], dataRevisao: null })
    }
    return responder(route, 200, {
      modalidade,
      secao,
      liberada: true,
      blocos: blocos.map(({ bloco, titulo, corpo, referencias }) => ({ bloco, titulo, corpo, referencias })),
      referencias: [...new Set(blocos.map((c) => c.referencias).filter(Boolean))],
      dataRevisao: blocos.map((c) => c.dataRevisao ?? '').sort().at(-1),
    })
  }

  private revisao(route: Route, caminho: string) {
    const metodo = route.request().method()
    if (caminho === '/revisao/conteudos' && metodo === 'GET') {
      return responder(route, 200, this.conteudos.filter((c) => c.estado === 'EM_REVISAO').sort(ordemDoSite))
    }

    const [, id, acao] = caminho.match(/^\/revisao\/conteudos\/(\d+)\/(aprovar|devolver)$/) ?? []
    const conteudo = this.conteudos.find((c) => c.id === Number(id))
    if (!acao || metodo !== 'POST') return this.naoSimulada(route, `${metodo} ${caminho}`)
    if (!conteudo) return this.problema(route, 404, 'Conteúdo não encontrado.')
    if (conteudo.estado !== 'EM_REVISAO') return this.problema(route, 409, 'Este conteúdo não está mais em revisão.')

    if (acao === 'aprovar') {
      Object.assign(conteudo, { estado: 'APROVADO', dataRevisao: hojeEmBrasilia(), motivoDevolucao: null })
      return responder(route, 200, conteudo)
    }
    const motivo = String(lerCorpo(route).motivo ?? '').trim()
    if (!motivo) return this.problema(route, 400, 'Dados inválidos.', { motivo: 'Escreva o motivo da devolução.' })
    Object.assign(conteudo, { estado: 'RASCUNHO', motivoDevolucao: motivo })
    return responder(route, 200, conteudo)
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
  const revisor = conta.revisor ?? false
  return { id, nome, perfil, revisor, instituicao, periodo, categoria, registro, uf, termosPendentes: false }
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
