import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet, Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../../renderComRotas'
import { PacientesPage } from '@/features/pacientes/PacientesPage'
import { PacienteFormPage } from '@/features/pacientes/PacienteFormPage'
import * as api from '@/features/pacientes/api'
import * as apiAvaliacao from '@/features/avaliacao/api'
import * as apiSessao from '@/features/sessao/api'
import { RegiaoToasts } from '@/shared/ui/Toasts'

const MARIA: api.Paciente = {
  id: 'a1',
  nome: 'Maria',
  sobrenome: 'Silva',
  identificador: 'A-001',
  email: null,
  dataNascimento: '1980-05-10',
  criadoEm: '2026-10-16T10:00:00Z',
  criadoPor: 'u1',
  alteradoEm: '2026-10-16T10:00:00Z',
  alteradoPor: 'u1',
}

function pagina(itens: api.Paciente[], extra: Partial<api.Pagina<api.Paciente>> = {}): api.Pagina<api.Paciente> {
  return { itens, pagina: 0, tamanho: 20, totalItens: itens.length, totalPaginas: 1, ...extra }
}

function renderizarLista(rota = '/pacientes') {
  return renderComRotas(
    <Route element={<main><Outlet /></main>}>
      <Route path="/pacientes" element={<PacientesPage />} />
      <Route path="/pacientes/:id" element={<p>detalhe</p>} />
    </Route>,
    rota,
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('lista de pacientes', () => {
  test('deveMostrarOAvisoDeDadosFicticios', async () => {
    vi.spyOn(api, 'listarPacientes').mockResolvedValue(pagina([]))
    renderizarLista()

    expect(screen.getByText('Ambiente acadêmico: use apenas dados fictícios.')).toBeInTheDocument()
  })

  test('deveListarNomeIdentificadorENascimento', async () => {
    vi.spyOn(api, 'listarPacientes').mockResolvedValue(pagina([MARIA]))
    renderizarLista()

    const linha = (await screen.findByRole('link', { name: 'Maria Silva' })).closest('tr') as HTMLElement
    expect(within(linha).getByText('A-001')).toBeInTheDocument()
    expect(within(linha).getByText('10/05/1980')).toBeInTheDocument()
  })

  test('deveOrdenarPelaColunaClicadaEInverterNoSegundoClique', async () => {
    const listar = vi.spyOn(api, 'listarPacientes').mockResolvedValue(pagina([MARIA]))
    renderizarLista()
    const usuario = userEvent.setup()

    await usuario.click(await screen.findByRole('button', { name: /Nascimento/ }))
    await waitFor(() => expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ ordenar: 'dataNascimento', direcao: 'asc' })))
    expect(screen.getByRole('columnheader', { name: /Nascimento/ })).toHaveAttribute('aria-sort', 'ascending')

    await usuario.click(screen.getByRole('button', { name: /Nascimento/ }))
    await waitFor(() => expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ ordenar: 'dataNascimento', direcao: 'desc' })))
    expect(screen.getByRole('columnheader', { name: /Nascimento/ })).toHaveAttribute('aria-sort', 'descending')
  })

  test('deveBuscarPeloTextoDigitado', async () => {
    const listar = vi.spyOn(api, 'listarPacientes').mockResolvedValue(pagina([]))
    renderizarLista()
    const usuario = userEvent.setup()

    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar por nome ou identificador' }), 'jose')
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ busca: 'jose', pagina: 0 })))
    expect(await screen.findByText('Nenhum paciente encontrado para "jose".')).toBeInTheDocument()
  })

  test('deveIrParaAUltimaPaginaQuandoAPedidaNaoExisteMais', async () => {
    const listar = vi
      .spyOn(api, 'listarPacientes')
      .mockImplementation(async (f) => (f.pagina === 0 ? pagina([MARIA], { totalItens: 20 }) : pagina([], { pagina: 1, totalItens: 20 })))
    renderizarLista('/pacientes?pagina=1')

    expect(await screen.findByRole('link', { name: 'Maria Silva' })).toBeInTheDocument()
    expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 0 }))
    expect(screen.queryByText('Nenhum paciente cadastrado ainda.')).not.toBeInTheDocument()
  })

  test('deveLerOrdenacaoEPaginaDaUrl', async () => {
    const listar = vi.spyOn(api, 'listarPacientes').mockResolvedValue(pagina([MARIA]))
    renderizarLista('/pacientes?ordenar=identificador&direcao=desc&pagina=2')

    await waitFor(() =>
      expect(listar).toHaveBeenCalledWith({ busca: '', ordenar: 'identificador', direcao: 'desc', pagina: 2 }),
    )
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    vi.spyOn(api, 'listarPacientes').mockResolvedValue(pagina([MARIA]))
    renderizarLista()
    await screen.findByRole('table')

    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('formulário de paciente', () => {
  function renderizarForm(rota = '/pacientes/novo') {
    return renderComRotas(
      <Route element={<><RegiaoToasts /><main><Outlet /></main></>}>
        <Route path="/pacientes" element={<p>lista</p>} />
        <Route path="/pacientes/novo" element={<PacienteFormPage />} />
        <Route path="/pacientes/:id" element={<PacienteFormPage />} />
      </Route>,
      rota,
    )
  }

  async function preencher(usuario: ReturnType<typeof userEvent.setup>) {
    await usuario.type(screen.getByLabelText('Nome'), 'Maria')
    await usuario.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await usuario.type(screen.getByLabelText('Identificador interno'), 'A-001')
    await usuario.type(screen.getByLabelText('Data de nascimento'), '1980-05-10')
  }

  test('deveCriarPacienteSemEmailEVoltarParaALista', async () => {
    const criar = vi.spyOn(api, 'criarPaciente').mockResolvedValue(MARIA)
    renderizarForm()
    const usuario = userEvent.setup()

    await preencher(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

    await waitFor(() =>
      expect(criar).toHaveBeenCalledWith({
        nome: 'Maria',
        sobrenome: 'Silva',
        identificador: 'A-001',
        email: null,
        dataNascimento: '1980-05-10',
      }),
    )
    expect(await screen.findByText('lista')).toBeInTheDocument()
    const toast = screen.getByText('Paciente cadastrado').closest('output')
    expect(toast).not.toBeNull()
    expect(toast).not.toHaveTextContent('Maria')
  })

  test('deveMostrarErroDosCamposObrigatorios', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nome')).toHaveFocus()
  })

  test('deveRecusarNascimentoNoFuturo', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await preencher(usuario)
    await usuario.clear(screen.getByLabelText('Data de nascimento'))
    await usuario.type(screen.getByLabelText('Data de nascimento'), '2999-01-01')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

    expect(await screen.findByText('A data de nascimento não pode estar no futuro.')).toBeInTheDocument()
  })

  test('deveMostrarNoCampoOIdentificadorRepetido', async () => {
    const erro = Object.assign(new Error('409'), {
      isAxiosError: true,
      response: { status: 409, data: { detail: 'Você já tem um paciente com este identificador.' } },
    })
    vi.spyOn(api, 'criarPaciente').mockRejectedValue(erro)
    renderizarForm()
    const usuario = userEvent.setup()

    await preencher(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

    expect(await screen.findAllByText('Você já tem um paciente com este identificador.')).not.toHaveLength(0)
    expect(screen.getByLabelText('Identificador interno')).toHaveAttribute('aria-invalid', 'true')
  })

  test('deveNaoPedirTelefone', () => {
    renderizarForm()

    expect(screen.queryByLabelText(/Telefone/)).not.toBeInTheDocument()
  })

  test('deveDeixarOIdentificadorEmMaiusculaSemEspacoNemSimbolo', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await usuario.type(screen.getByLabelText('Identificador interno'), 'caso 01#')

    expect(screen.getByLabelText('Identificador interno')).toHaveValue('CASO01')
  })

  test('deveImpedirDigitoNoNome', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await usuario.type(screen.getByLabelText('Nome'), 'Ma2ria')

    expect(screen.getByLabelText('Nome')).toHaveValue('Maria')
  })

  test('deveMostrarExemploEmCadaCampo', () => {
    renderizarForm()

    expect(screen.getByLabelText('E-mail (opcional)')).toHaveAttribute('placeholder', 'nome@exemplo.com')
    expect(screen.getByLabelText('Identificador interno')).toHaveAttribute('placeholder', 'CASO-01')
  })

  test('deveRecusarIdentificadorComCaraDeCpfENascimentoAntigo', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await preencher(usuario)
    await usuario.clear(screen.getByLabelText('Identificador interno'))
    await usuario.type(screen.getByLabelText('Identificador interno'), '12345678901')
    await usuario.clear(screen.getByLabelText('Data de nascimento'))
    await usuario.type(screen.getByLabelText('Data de nascimento'), '1850-01-01')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

    expect(await screen.findByText('Parece um documento (CPF). Use um código interno, como CASO-01.')).toBeInTheDocument()
    expect(screen.getByText('Confira o ano: use uma data a partir de 1900.')).toBeInTheDocument()
  })

  test('deveRecusarEmailSemDominioCompleto', async () => {
    renderizarForm()
    const usuario = userEvent.setup()

    await preencher(usuario)
    await usuario.type(screen.getByLabelText('E-mail (opcional)'), 'joao@teste')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

    expect(await screen.findByText('Informe um e-mail válido, como nome@exemplo.com.')).toBeInTheDocument()
  })

  test('deveMostrarEspereEIrParaAListaSemEsperarARebuscaDoPacienteExcluido', async () => {
    const buscar = vi.spyOn(api, 'buscarPaciente').mockResolvedValue(MARIA)
    vi.spyOn(apiAvaliacao, 'listarAvaliacoes').mockResolvedValue([])
    vi.spyOn(apiSessao, 'listarSessoes').mockResolvedValue([])
    let concluir: () => void = () => {}
    vi.spyOn(api, 'excluirPaciente').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          concluir = () => {
            // Depois de excluído, rebuscar o paciente nunca responde: seria a espera de segundos antes do redirecionamento.
            buscar.mockImplementation(() => new Promise(() => {}))
            resolve()
          }
        }),
    )
    renderizarForm('/pacientes/a1')
    const usuario = userEvent.setup()

    expect(await screen.findByDisplayValue('Maria')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Excluir paciente' }))
    const dialogo = await screen.findByRole('dialog')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Excluir' }))

    const excluindo = await within(dialogo).findByRole('button', { name: /Excluindo/ })
    expect(excluindo).toBeDisabled()
    expect(excluindo).toHaveAttribute('aria-busy', 'true')
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(within(dialogo).getByRole('status')).toHaveTextContent('Excluindo o paciente')

    concluir()
    expect(await screen.findByText('lista', {}, { timeout: 1000 })).toBeInTheDocument()
  })

  test('deveEditarEExcluirComConfirmacao', async () => {
    vi.spyOn(api, 'buscarPaciente').mockResolvedValue(MARIA)
    vi.spyOn(apiAvaliacao, 'listarAvaliacoes').mockResolvedValue([])
    vi.spyOn(apiSessao, 'listarSessoes').mockResolvedValue([])
    const excluir = vi.spyOn(api, 'excluirPaciente').mockResolvedValue()
    renderizarForm('/pacientes/a1')
    const usuario = userEvent.setup()

    expect(await screen.findByDisplayValue('Maria')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Excluir paciente' }))
    const dialogo = await screen.findByRole('dialog')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(excluir).toHaveBeenCalledWith('a1'))
    expect(await screen.findByText('lista')).toBeInTheDocument()
    expect(screen.getByText('Paciente excluído').closest('output')).not.toBeNull()
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    renderizarForm()

    expect(await axe(document.body)).toHaveNoViolations()
  })
})

test('deveMostrarNoAlertaOErroDeCampoQueNaoEstaNaTela', async () => {
  const erro = Object.assign(new Error('400'), {
    isAxiosError: true,
    response: { status: 400, data: { erros: { campoNovo: 'Informe o campo novo.' } } },
  })
  vi.spyOn(api, 'criarPaciente').mockRejectedValue(erro)
  renderComRotas(
    <Route element={<main><Outlet /></main>}>
      <Route path="/pacientes/novo" element={<PacienteFormPage />} />
    </Route>,
    '/pacientes/novo',
  )
  const usuario = userEvent.setup()

  await usuario.type(screen.getByLabelText('Nome'), 'Maria')
  await usuario.type(screen.getByLabelText('Sobrenome'), 'Silva')
  await usuario.type(screen.getByLabelText('Identificador interno'), 'A-001')
  await usuario.type(screen.getByLabelText('Data de nascimento'), '1980-05-10')
  await usuario.click(screen.getByRole('button', { name: 'Cadastrar paciente' }))

  expect(await screen.findByText('Confira os campos destacados. Informe o campo novo.')).toBeInTheDocument()
})
