import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { CompletarCadastroPage } from './CompletarCadastroPage'
import { renderComRotas } from '../../../test/renderComRotas'

const { estado, cadastrar, sair } = vi.hoisted(() => ({
  estado: {
    metadata: {} as Record<string, unknown>,
    usuario: { isPending: false, data: null as object | null },
  },
  cadastrar: vi.fn(),
  sair: vi.fn(),
}))

vi.mock('../../../shared/auth/useAuth', () => ({
  useAuth: () => ({ sessao: { user: { user_metadata: estado.metadata } }, carregando: false, sair }),
}))
vi.mock('../../usuario/useUsuarioAtual', () => ({
  CHAVE_USUARIO_ATUAL: ['usuario', 'me'],
  useUsuarioAtual: () => estado.usuario,
}))
vi.mock('../../usuario/cadastrarUsuario', () => ({
  cadastrarUsuario: cadastrar,
  lerErroDeCadastro: () => ({ jaCadastrado: false, mensagem: 'Dados inválidos.', campos: {} }),
}))

function renderizar() {
  return renderComRotas(
    <>
      <Route path="/completar-cadastro" element={<CompletarCadastroPage />} />
      <Route path="/login" element={<p>tela de login</p>} />
      <Route path="/" element={<p>tela inicial</p>} />
    </>,
    '/completar-cadastro',
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.metadata = {}
  estado.usuario = { isPending: false, data: null }
  cadastrar.mockResolvedValue({})
})

test('deveEnviarSozinhoOsDadosGuardadosNoCadastro', async () => {
  estado.metadata = { cadastro: { aceiteTermos: true, nome: 'Ana Souza', perfil: 'ESTUDANTE', instituicao: 'UniBH', periodo: 5 } }
  renderizar()

  expect(await screen.findByText('Cadastro concluído')).toBeInTheDocument()
  expect(cadastrar).toHaveBeenCalledWith({ aceiteTermos: true, nome: 'Ana Souza', perfil: 'ESTUDANTE', instituicao: 'UniBH', periodo: 5 })
})

test('deveMostrarOFormularioQuandoNaoHaDadosGuardados', () => {
  renderizar()

  expect(screen.getByRole('heading', { name: 'Complete seu cadastro' })).toBeInTheDocument()
  expect(cadastrar).not.toHaveBeenCalled()
})

test('deveSugerirONomeQueVemDoGoogle', async () => {
  estado.metadata = { full_name: 'Bia Lima' }
  renderizar()

  expect(await screen.findByLabelText('Nome completo')).toHaveValue('Bia Lima')
})

test('deveEnviarOFormularioPreenchidoEConcluir', async () => {
  estado.metadata = { full_name: 'Bia Lima' }
  renderizar()

  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UFMG')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '3')
  await userEvent.click(screen.getByLabelText(/Li e aceito/))
  await userEvent.click(screen.getByRole('button', { name: 'Concluir cadastro' }))

  expect(await screen.findByText('Cadastro concluído')).toBeInTheDocument()
  expect(cadastrar).toHaveBeenCalledWith({ nome: 'Bia Lima', aceiteTermos: true, perfil: 'ESTUDANTE', instituicao: 'UFMG', periodo: 3 })
})

test('deveMostrarOErroDaApiSemPerderOFormulario', async () => {
  cadastrar.mockRejectedValue(new Error('recusado'))
  estado.metadata = { full_name: 'Bia Lima' }
  renderizar()

  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UFMG')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '3')
  await userEvent.click(screen.getByLabelText(/Li e aceito/))
  await userEvent.click(screen.getByRole('button', { name: 'Concluir cadastro' }))

  expect(await screen.findByText('Dados inválidos.')).toBeInTheDocument()
  expect(screen.getByLabelText('Instituição de ensino')).toHaveValue('UFMG')
})

test('deveLevarParaOInicioQuemJaTemCadastro', () => {
  estado.usuario = { isPending: false, data: { perfil: 'ESTUDANTE' } }
  renderizar()

  expect(screen.getByText('tela inicial')).toBeInTheDocument()
})

test('deveSerAcessivel', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})

test('deveExigirOAceiteDosTermosAoCompletar', async () => {
  estado.metadata = { full_name: 'Bia Lima' }
  renderizar()

  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UFMG')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '3')
  await userEvent.click(screen.getByRole('button', { name: 'Concluir cadastro' }))

  expect(await screen.findByText('Aceite os termos de uso e a política de privacidade')).toBeInTheDocument()
  expect(cadastrar).not.toHaveBeenCalled()
})
