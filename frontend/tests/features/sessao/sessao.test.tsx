import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet, Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../../renderComRotas'
import { SessaoFormPage } from '@/features/sessao/SessaoFormPage'
import * as api from '@/features/sessao/api'
import * as apiAvaliacao from '@/features/avaliacao/api'

vi.mock('@/features/usuario/useUsuarioAtual', () => ({
  CHAVE_USUARIO_ATUAL: ['usuario', 'me'],
  useUsuarioAtual: () => ({ data: { nome: 'Bia Lima', perfil: 'PROFISSIONAL' }, isPending: false }),
}))

const ANTERIOR: api.Sessao = {
  id: 's0',
  pacienteId: 'p1',
  profissionalId: 'u1',
  dataHora: '2026-10-01T14:00:00Z',
  objetivo: 'Reduzir dor',
  modalidade: 'TENS',
  aparelho: 'Neurodyn Portable',
  modo: 'Convencional',
  duracaoRealMin: 20,
  canais: [{ canal: 1, frequenciaHz: 80, larguraPulsoUs: 100, amplitudeInicialMa: 0, amplitudeFinalMa: 18, par: '1A-1B' }],
  eletrodoTipo: 'Borracha condutiva',
  eletrodoDimensoes: '5 cm × 5 cm',
  lado: 'ESQUERDO',
  marcos: 'Patela',
  montagemId: 'joelho',
  sensacao: null,
  contracao: null,
  tolerancia: null,
  fadiga: null,
  ajustes: null,
  medidaAntes: null,
  medidaDepois: null,
  medidaContexto: null,
  condicaoPele: 'Sem alteração',
  motivoTermino: 'Tempo programado',
  planoReavaliacao: 'Reavaliar',
  checklist: [],
  criadoEm: '2026-10-01T15:00:00Z',
}

function renderizar() {
  return renderComRotas(
    <Route element={<main><Outlet /></main>}>
      <Route path="/pacientes/:id" element={<p>paciente</p>} />
      <Route path="/pacientes/:id/sessoes/nova" element={<SessaoFormPage />} />
    </Route>,
    '/pacientes/p1/sessoes/nova',
  )
}

async function preencherObrigatorios(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText('Data e hora'), '2026-10-10T14:00')
  await usuario.type(screen.getByLabelText('Objetivo desta sessão'), 'Reduzir dor na tarefa')
  await usuario.type(screen.getByLabelText(/Duração real/), '20')
  await usuario.type(screen.getByLabelText(/Frequência do canal 1/), '80')
  await usuario.type(screen.getByLabelText(/Largura de pulso do canal 1/), '100')
  await usuario.type(screen.getByLabelText(/Amplitude final do canal 1/), '18')
  await usuario.type(screen.getByLabelText('Par de eletrodos do canal 1'), '1A-1B')
  await usuario.type(screen.getByLabelText('Tipo de eletrodo'), 'Borracha condutiva')
  await usuario.type(screen.getByLabelText('Dimensões'), '5 cm × 5 cm')
  await usuario.selectOptions(screen.getByLabelText('Lado'), 'ESQUERDO')
  await usuario.type(screen.getByLabelText('Marcos anatômicos'), 'Patela')
  await usuario.type(screen.getByLabelText('Condição da pele'), 'Sem alteração')
  await usuario.type(screen.getByLabelText('Motivo do término'), 'Tempo programado')
  await usuario.type(screen.getByLabelText('Plano de reavaliação'), 'Reavaliar a mesma tarefa')
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(api, 'listarSessoes').mockResolvedValue([])
  vi.spyOn(apiAvaliacao, 'listarAvaliacoes').mockResolvedValue([])
})

test('deveTerOsSeisBlocosDoCard', () => {
  renderizar()

  for (const bloco of ['Contexto', 'Aplicação', 'Eletrodos', 'Resposta', 'Resultado', 'Encerramento']) {
    expect(screen.getByRole('heading', { name: bloco, level: 2 })).toBeInTheDocument()
  }
  expect(screen.getByText('Bia Lima')).toBeInTheDocument()
})

test('deveMostrarAUnidadeEmCadaParametro', () => {
  renderizar()

  const aplicacao = screen.getByRole('region', { name: 'Aplicação' })
  for (const unidade of ['Hz', 'µs', 'mA', 'min']) {
    expect(within(aplicacao).getAllByText(unidade).length).toBeGreaterThan(0)
  }
})

test('deveRevisarAntesDeSalvarEAnunciarAConfirmacao', async () => {
  const registrar = vi.spyOn(api, 'registrarSessao').mockResolvedValue(ANTERIOR)
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))

  expect(await screen.findByRole('heading', { name: 'Revise antes de salvar' })).toBeInTheDocument()
  expect(screen.getByText('80 Hz · 100 µs · 18 mA (final) · par 1A-1B')).toBeInTheDocument()
  expect(registrar).not.toHaveBeenCalled()

  await usuario.click(screen.getByRole('button', { name: 'Salvar sessão' }))

  await waitFor(() => expect(registrar).toHaveBeenCalled())
  expect(registrar.mock.calls[0][1]).toMatchObject({ duracaoRealMin: 20, canais: [{ canal: 1, frequenciaHz: 80 }] })
  expect((await screen.findByText(/^Sessão registrada./)).closest('output')).not.toBeNull()
})

test('deveVoltarDaRevisaoParaCorrigir', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))
  await usuario.click(await screen.findByRole('button', { name: 'Voltar e corrigir' }))

  expect(screen.getByLabelText('Objetivo desta sessão')).toHaveValue('Reduzir dor na tarefa')
})

test('deveExigirOsCamposObrigatoriosAntesDaRevisao', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))

  expect(await screen.findByText('Informe o objetivo desta sessão.')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Revise antes de salvar' })).not.toBeInTheDocument()
})

test('deveAvisarAoReaproveitarASessaoAnterior', async () => {
  vi.spyOn(api, 'listarSessoes').mockResolvedValue([ANTERIOR])
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Reaproveitar a sessão anterior' }))

  expect(screen.getByText('Parâmetros anteriores não substituem a avaliação desta sessão.')).toBeInTheDocument()
  expect(screen.getByLabelText(/Frequência do canal 1/)).toHaveValue('80')
  expect(screen.getByLabelText('Data e hora')).toHaveValue('')
})

test('devePreencherEletrodosAPartirDaPranchaEscolhida', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await usuario.selectOptions(screen.getByLabelText('Prancha do atlas (opcional)'), 'joelho')

  expect(screen.getByLabelText('Lado')).toHaveValue('ESQUERDO')
  expect(screen.getByLabelText('Tipo de eletrodo')).toHaveValue('Borracha condutiva')
  expect(screen.getByLabelText('Marcos anatômicos')).toHaveValue('Patela central, região superior medial e inferior lateral.')
})

test('deveMostrarOMotivoQuandoOServidorRecusaAData', async () => {
  vi.spyOn(api, 'registrarSessao').mockRejectedValue({
    response: { status: 400, data: { erros: { dataHora: 'A sessão não pode ser antes do nascimento do paciente.' } } },
  })
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))
  await usuario.click(await screen.findByRole('button', { name: 'Salvar sessão' }))

  expect(await screen.findByText('A sessão não pode ser antes do nascimento do paciente.')).toBeInTheDocument()
})

test('deveAceitarVirgulaNaAmplitudeInicial', async () => {
  const registrar = vi.spyOn(api, 'registrarSessao').mockResolvedValue(ANTERIOR)
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.type(screen.getByLabelText(/Amplitude inicial do canal 1/), '2,5')
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))
  await usuario.click(await screen.findByRole('button', { name: 'Salvar sessão' }))

  await waitFor(() => expect(registrar).toHaveBeenCalled())
  expect(registrar.mock.calls[0][1].canais[0].amplitudeInicialMa).toBe(2.5)
})

test.each([
  [/Frequência do canal 1/, '2,55'],
  [/Amplitude final do canal 1/, '0,04'],
  [/Amplitude inicial do canal 1/, '1,25'],
  [/Duração real/, '0,04'],
])('deveRecusarMaisDeUmaCasaDecimalEm %s', async (rotulo, valor) => {
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.clear(screen.getByLabelText(rotulo))
  await usuario.type(screen.getByLabelText(rotulo), valor)
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))

  expect(await screen.findByText('Use no máximo uma casa decimal.')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Revise antes de salvar' })).not.toBeInTheDocument()
})

test('deveRecusarDecimalNaLarguraDePulso', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.type(screen.getByLabelText(/Largura de pulso do canal 1/), ',5')
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))

  expect(await screen.findByText('Use um número inteiro.')).toBeInTheDocument()
})

test('deveDescartarAPranchaQuandoAModalidadeMuda', async () => {
  const registrar = vi.spyOn(api, 'registrarSessao').mockResolvedValue(ANTERIOR)
  renderizar()
  const usuario = userEvent.setup()

  await usuario.selectOptions(screen.getByLabelText('Prancha do atlas (opcional)'), 'joelho')
  await usuario.selectOptions(screen.getByLabelText('Modalidade'), 'FES')
  expect(screen.getByLabelText('Prancha do atlas (opcional)')).toHaveValue('')

  await preencherObrigatorios(usuario)
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))
  await usuario.click(await screen.findByRole('button', { name: 'Salvar sessão' }))

  await waitFor(() => expect(registrar).toHaveBeenCalled())
  expect(registrar.mock.calls[0][1].montagemId).toBeNull()
})

test('deveSalvarOsItensMarcadosDoChecklist', async () => {
  const registrar = vi.spyOn(api, 'registrarSessao').mockResolvedValue(ANTERIOR)
  renderizar()
  const usuario = userEvent.setup()

  await preencherObrigatorios(usuario)
  await usuario.click(screen.getByRole('checkbox', { name: 'Objetivo definido?' }))
  await usuario.click(screen.getByRole('button', { name: 'Revisar sessão' }))
  await usuario.click(await screen.findByRole('button', { name: 'Salvar sessão' }))

  await waitFor(() => expect(registrar).toHaveBeenCalled())
  expect(registrar.mock.calls[0][1].checklist).toEqual(['antes.objetivo-definido'])
})

const AVALIACAO: apiAvaliacao.Avaliacao = {
  id: 'av1',
  pacienteId: 'p1',
  dataAvaliacao: '2026-10-10',
  queixa: null,
  historico: null,
  dorEscala: null,
  dorContexto: null,
  dorTarefa: null,
  dorMomento: null,
  objetivo: null,
  plano: null,
  triagem: {
    DISPOSITIVO_IMPLANTADO: 'AUSENTE',
    GESTACAO: 'PRESENTE',
    SUSPEITA_TROMBOSE: 'NAO_AVALIADO',
    INFECCAO: 'PRESENTE',
    ALTERACAO_PELE_SENSIBILIDADE: 'AUSENTE',
    RESTRICOES: 'NAO_AVALIADO',
  },
  achados: [],
  criadoEm: '2026-10-10T10:00:00Z',
  criadoPor: 'u1',
  alteradoEm: '2026-10-10T10:00:00Z',
  alteradoPor: 'u1',
}

test('deveAvisarOsItensDaTriagemPresentesNaUltimaAvaliacao', async () => {
  vi.spyOn(apiAvaliacao, 'listarAvaliacoes').mockResolvedValue([AVALIACAO])
  renderizar()

  expect(await screen.findByText('Triagem presente na avaliação de 10/10/2026: Gestação, Infecção.')).toBeInTheDocument()
  expect(screen.getByText('Itens ainda não avaliados: Suspeita de trombose, Restrições.')).toBeInTheDocument()
})

test('deveAvisarQuandoOPacienteNaoTemAvaliacao', async () => {
  renderizar()

  expect(await screen.findByText('Este paciente ainda não tem avaliação inicial.')).toBeInTheDocument()
})

test('deveAvisarQuandoATriagemNaoCarrega', async () => {
  vi.spyOn(apiAvaliacao, 'listarAvaliacoes').mockRejectedValue(new Error('rede'))
  renderizar()

  expect(await screen.findByText('Não foi possível carregar a triagem da última avaliação.')).toBeInTheDocument()
})

test('deveSerAcessivelSemViolacoes', async () => {
  renderizar()

  expect(await axe(document.body)).toHaveNoViolations()
})
