import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'

const { estado, refetch, sair } = vi.hoisted(() => ({
  estado: {
    auth: { sessao: null as object | null, carregando: false },
    mfa: { atual: 'aal1', proximo: 'aal1' } as object | null,
    usuario: { isPending: false, isError: false, data: undefined as object | null | undefined },
  },
  refetch: vi.fn(),
  sair: vi.fn(),
}))

vi.mock('../../shared/auth/useAuth', () => ({ useAuth: () => ({ ...estado.auth, sair }) }))
vi.mock('../mfa/useNivelMfa', () => ({ useNivelMfa: () => estado.mfa }))
vi.mock('../usuario/useUsuarioAtual', () => ({ useUsuarioAtual: () => ({ ...estado.usuario, refetch }) }))

function renderizar(perfil?: 'ESTUDANTE' | 'PROFISSIONAL', semMfa = false) {
  return render(
    <MemoryRouter initialEntries={['/area']}>
      <Routes>
        <Route path="/login" element={<p>tela de login</p>} />
        <Route path="/completar-cadastro" element={<p>tela de completar cadastro</p>} />
        <Route path="/" element={<p>tela inicial</p>} />
        <Route path="/mfa/verificar" element={<p>tela de verificar mfa</p>} />
        <Route path="/mfa/ativar" element={<p>tela de ativar mfa</p>} />
        <Route element={<ProtectedRoute perfil={perfil} semMfa={semMfa} />}>
          <Route path="/area" element={<p>area protegida</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.auth = { sessao: { access_token: 'x' }, carregando: false }
  estado.usuario = { isPending: false, isError: false, data: { perfil: 'ESTUDANTE' } }
  estado.mfa = { atual: 'aal1', proximo: 'aal1' }
})

test('deveEsperarEnquantoASessaoCarrega', () => {
  estado.auth = { sessao: null, carregando: true }
  renderizar()

  expect(screen.getByText('Carregando…')).toBeInTheDocument()
})

test('deveLevarParaOLoginSemSessao', () => {
  estado.auth = { sessao: null, carregando: false }
  renderizar()

  expect(screen.getByText('tela de login')).toBeInTheDocument()
})

test('deveEsperarEnquantoOPerfilCarrega', () => {
  estado.usuario = { isPending: true, isError: false, data: undefined }
  renderizar()

  expect(screen.getByText('Carregando…')).toBeInTheDocument()
})

test('deveLevarParaCompletarCadastroQuandoALogadoNaoTemPerfil', () => {
  estado.usuario = { isPending: false, isError: false, data: null }
  renderizar()

  expect(screen.getByText('tela de completar cadastro')).toBeInTheDocument()
})

test('devePermitirQuemTemPerfil', () => {
  renderizar()

  expect(screen.getByText('area protegida')).toBeInTheDocument()
})

test('deveLevarParaOInicioQuandoOPerfilNaoCombina', () => {
  renderizar('PROFISSIONAL')

  expect(screen.getByText('tela inicial')).toBeInTheDocument()
})

test('devePermitirQuandoOPerfilCombina', () => {
  estado.usuario = { isPending: false, isError: false, data: { perfil: 'PROFISSIONAL' } }
  estado.mfa = { atual: 'aal2', proximo: 'aal2' }
  renderizar('PROFISSIONAL')

  expect(screen.getByText('area protegida')).toBeInTheDocument()
})

test('deveOferecerTentarDeNovoQuandoAApiNaoResponde', async () => {
  estado.usuario = { isPending: false, isError: true, data: undefined }
  renderizar()

  expect(screen.getByText('Não foi possível carregar seus dados')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
  expect(refetch).toHaveBeenCalledTimes(1)

  await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
  expect(sair).toHaveBeenCalledTimes(1)
})

test('deveExigirOCodigoQuandoATemAutenticadorEASessaoAindaNaoFoiVerificada', () => {
  estado.mfa = { atual: 'aal1', proximo: 'aal2' }
  renderizar()

  expect(screen.getByText('tela de verificar mfa')).toBeInTheDocument()
})

test('devePermitirQuemJaVerificouOCodigo', () => {
  estado.mfa = { atual: 'aal2', proximo: 'aal2' }
  renderizar()

  expect(screen.getByText('area protegida')).toBeInTheDocument()
})

test('deveObrigarProfissionalSemAutenticadorAAtivar', () => {
  estado.usuario = { isPending: false, isError: false, data: { perfil: 'PROFISSIONAL' } }
  renderizar()

  expect(screen.getByText('tela de ativar mfa')).toBeInTheDocument()
})

test('deveNaoObrigarEstudanteSemAutenticador', () => {
  renderizar()

  expect(screen.getByText('area protegida')).toBeInTheDocument()
})

test('deveDeixarAsTelasDeMfaAbrirSemExigirMfa', () => {
  estado.usuario = { isPending: false, isError: false, data: { perfil: 'PROFISSIONAL' } }
  renderizar(undefined, true)

  expect(screen.getByText('area protegida')).toBeInTheDocument()
})
