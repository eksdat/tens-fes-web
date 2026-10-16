import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet, Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../../renderComRotas'
import { AvaliacaoFormPage } from '@/features/avaliacao/AvaliacaoFormPage'
import { AvaliacoesDoPaciente } from '@/features/avaliacao/AvaliacoesDoPaciente'
import * as api from '@/features/avaliacao/api'
import * as apiPacientes from '@/features/pacientes/api'

const AVALIACAO: api.Avaliacao = {
  id: 'av1',
  pacienteId: 'p1',
  dataAvaliacao: '2026-10-10',
  queixa: 'Dor no joelho',
  historico: null,
  dorEscala: 6,
  dorContexto: null,
  dorTarefa: null,
  dorMomento: null,
  objetivo: null,
  plano: null,
  triagem: {
    DISPOSITIVO_IMPLANTADO: 'AUSENTE',
    GESTACAO: 'NAO_AVALIADO',
    SUSPEITA_TROMBOSE: 'NAO_AVALIADO',
    INFECCAO: 'NAO_AVALIADO',
    ALTERACAO_PELE_SENSIBILIDADE: 'NAO_AVALIADO',
    RESTRICOES: 'NAO_AVALIADO',
  },
  achados: [],
  criadoEm: '2026-10-10T10:00:00Z',
  criadoPor: 'u1',
  alteradoEm: '2026-10-10T10:00:00Z',
  alteradoPor: 'u1',
}

function renderizarForm(rota = '/pacientes/p1/avaliacoes/nova') {
  return renderComRotas(
    <Route element={<main><Outlet /></main>}>
      <Route path="/pacientes/:id" element={<p>paciente</p>} />
      <Route path="/pacientes/:id/avaliacoes/nova" element={<AvaliacaoFormPage />} />
      <Route path="/pacientes/:id/avaliacoes/:avaliacaoId" element={<AvaliacaoFormPage />} />
    </Route>,
    rota,
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(apiPacientes, 'buscarPaciente').mockResolvedValue({
    id: 'p1',
    nome: 'Maria',
    sobrenome: 'Silva',
    identificador: 'A-1',
    email: null,
    dataNascimento: '1980-05-10',
    criadoEm: '2026-10-01T10:00:00Z',
    criadoPor: 'u1',
    alteradoEm: '2026-10-01T10:00:00Z',
    alteradoPor: 'u1',
  })
})

async function preencherMinimo(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText('Data da avaliação'), '2026-10-10')
  await usuario.type(screen.getByLabelText('Descreva a queixa'), 'Dor no joelho')
  await usuario.type(screen.getByLabelText('Objetivo mensurável'), 'Comparar a dor na mesma tarefa')
}

describe('formulário de avaliação', () => {
  test('deveTerOsSeteBlocosDoGuia', () => {
    renderizarForm()

    for (const bloco of ['Queixa', 'Histórico', 'Triagem', 'Dor', 'Pele e sensibilidade', 'Função motora', 'Objetivo e plano']) {
      expect(screen.getByRole('heading', { name: bloco, level: 2 })).toBeInTheDocument()
    }
  })

  test('deveComecarTodaTriagemEmNaoAvaliado', () => {
    renderizarForm()

    const triagem = screen.getByRole('group', { name: 'Gestação' })
    expect(within(triagem).getByRole('radio', { name: 'Não avaliado' })).toBeChecked()
    expect(within(triagem).getByRole('radio', { name: 'Ausente' })).not.toBeChecked()
  })

  test('deveEnviarDorVaziaComoNulaENuncaZero', async () => {
    const criar = vi.spyOn(api, 'criarAvaliacao').mockResolvedValue(AVALIACAO)
    renderizarForm()
    const usuario = userEvent.setup()

    await preencherMinimo(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    await waitFor(() => expect(criar).toHaveBeenCalled())
    expect(criar.mock.calls[0][1]).toMatchObject({ dorEscala: null })
    expect(criar.mock.calls[0][1].triagem.GESTACAO).toBe('NAO_AVALIADO')
  })

  test('deveExigirLadoRegiaoEMetodoNoAchado', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await usuario.type(screen.getByLabelText('Data da avaliação'), '2026-10-10')
    await usuario.click(screen.getByRole('button', { name: 'Adicionar achado de pele e sensibilidade' }))
    await usuario.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    expect(await screen.findByText('Informe a região.')).toBeInTheDocument()
    expect(screen.getByText('Informe o método.')).toBeInTheDocument()
    expect(screen.getByText('Informe o lado.')).toBeInTheDocument()
  })

  test('deveRecusarDorForaDaEscala', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await usuario.type(screen.getByLabelText('Data da avaliação'), '2026-10-10')
    await usuario.type(screen.getByLabelText(/Dor de 0 a 10/), '11')
    await usuario.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    expect(await screen.findByText('Use a escala de 0 a 10.')).toBeInTheDocument()
  })

  test('deveCarregarAvaliacaoExistenteParaEditar', async () => {
    vi.spyOn(api, 'buscarAvaliacao').mockResolvedValue(AVALIACAO)
    renderizarForm('/pacientes/p1/avaliacoes/av1')

    expect(await screen.findByDisplayValue('Dor no joelho')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Dispositivo eletrônico implantado' })).getByRole('radio', { name: 'Ausente' })).toBeChecked()
  })

  test('deveExigirQueixaEObjetivo', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await usuario.type(screen.getByLabelText('Data da avaliação'), '2026-10-10')
    await usuario.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    expect(await screen.findByText('Descreva a queixa.')).toBeInTheDocument()
    expect(screen.getByText('Informe o objetivo mensurável.')).toBeInTheDocument()
  })

  test('deveAceitarSoDigitosNaDorComNoMaximoDoisCaracteres', async () => {
    renderizarForm()
    const usuario = userEvent.setup()
    const dor = screen.getByLabelText(/Dor de 0 a 10/)

    await usuario.type(dor, 'x7a')
    expect(dor).toHaveValue('7')
    await usuario.clear(dor)
    await usuario.type(dor, '105')
    expect(dor).toHaveValue('10')
  })

  test('deveExigirTarefaEMomentoQuandoADorFoiInformada', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await preencherMinimo(usuario)
    await usuario.type(screen.getByLabelText(/Dor de 0 a 10/), '6')
    await usuario.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    expect(await screen.findByText('Com a dor informada, registre a tarefa.')).toBeInTheDocument()
    expect(screen.getByText('Com a dor informada, registre o momento.')).toBeInTheDocument()
  })

  test('deveRecusarDataAntesDoNascimentoDoPaciente', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await preencherMinimo(usuario)
    await usuario.clear(screen.getByLabelText('Data da avaliação'))
    await usuario.type(screen.getByLabelText('Data da avaliação'), '1979-01-01')
    await usuario.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    expect(await screen.findByText('A avaliação não pode ser antes do nascimento do paciente.')).toBeInTheDocument()
  })

  test('deveMostrarExemploNosCampos', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    expect(screen.getByLabelText(/Dor de 0 a 10/)).toHaveAttribute('placeholder', '0 a 10')
    expect(screen.getByLabelText('Tarefa')).toHaveAttribute('placeholder', 'Subir 10 degraus')
    await usuario.click(screen.getByRole('button', { name: 'Adicionar achado de pele e sensibilidade' }))
    expect(screen.getByLabelText('Região')).toHaveAttribute('placeholder', 'Joelho')
    expect(screen.getByLabelText('Método')).toHaveAttribute('placeholder', 'Inspeção')
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    renderizarForm()

    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('lista de avaliações do paciente', () => {
  test('deveListarDaMaisRecenteEInverterAoClicarNaData', async () => {
    const listar = vi
      .spyOn(api, 'listarAvaliacoes')
      .mockResolvedValue([AVALIACAO, { ...AVALIACAO, id: 'av0', dataAvaliacao: '2026-09-01', dorEscala: null }])
    renderComRotas(<Route path="/p" element={<main><AvaliacoesDoPaciente pacienteId="p1" /></main>} />, '/p')
    const usuario = userEvent.setup()

    expect(await screen.findByText('10/10/2026')).toBeInTheDocument()
    expect(screen.getByText('Não avaliada')).toBeInTheDocument()
    expect(listar).toHaveBeenLastCalledWith('p1', 'desc')

    await usuario.click(screen.getByRole('button', { name: /Data/ }))
    await waitFor(() => expect(listar).toHaveBeenLastCalledWith('p1', 'asc'))
    expect(screen.getByRole('columnheader', { name: /Data/ })).toHaveAttribute('aria-sort', 'ascending')
  })
})
