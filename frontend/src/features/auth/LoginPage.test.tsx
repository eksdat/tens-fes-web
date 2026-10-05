import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { axe } from 'vitest-axe'
import { LoginPage } from './LoginPage'

const { authMock, estado } = vi.hoisted(() => ({
  authMock: { signInWithPassword: vi.fn(), resend: vi.fn() },
  estado: { sessao: null as object | null },
}))

vi.mock('../../shared/api/supabase', () => ({
  supabase: { auth: authMock },
  urlDeRetornoAuth: () => `${window.location.origin}/auth/callback`,
}))
vi.mock('../../shared/auth/useAuth', () => ({
  useAuth: () => ({ sessao: estado.sessao, carregando: false, sair: vi.fn() }),
}))

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>tela inicial</p>} />
        <Route path="/cadastro" element={<p>tela de cadastro</p>} />
        <Route path="/esqueci-senha" element={<p>tela de esqueci a senha</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function preencher(email = 'ana@exemplo.com', senha = 'SenhaForte1!') {
  await userEvent.type(screen.getByLabelText('E-mail'), email)
  await userEvent.type(screen.getByLabelText('Senha'), senha)
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.sessao = null
})

test('deveMostrarOsErrosJuntoAosCamposVazios', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('Informe seu e-mail')).toBeInTheDocument()
  expect(screen.getByText('Informe sua senha')).toBeInTheDocument()
  expect(authMock.signInWithPassword).not.toHaveBeenCalled()
})

test('deveRecusarEmailMalFormado', async () => {
  renderizar()

  await preencher('ana@')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument()
  expect(authMock.signInWithPassword).not.toHaveBeenCalled()
})

test('deveEntrarELevarParaOInicio', async () => {
  authMock.signInWithPassword.mockResolvedValue({ error: null })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('tela inicial')).toBeInTheDocument()
  expect(authMock.signInWithPassword).toHaveBeenCalledWith({
    email: 'ana@exemplo.com',
    password: 'SenhaForte1!',
    options: { captchaToken: undefined },
  })
})

test('deveDizerEmailOuSenhaIncorretosSemRevelarQualDosDois', async () => {
  authMock.signInWithPassword.mockResolvedValue({ error: { code: 'invalid_credentials' } })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument()
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível entrar')
})

test('deveAvisarDeLimiteDeTentativas', async () => {
  authMock.signInWithPassword.mockResolvedValue({ error: { code: 'over_request_rate_limit' } })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText(/Muitas tentativas/)).toBeInTheDocument()
})

test('deveOferecerReenvioQuandoOEmailNaoFoiConfirmado', async () => {
  authMock.signInWithPassword.mockResolvedValue({ error: { code: 'email_not_confirmed' } })
  authMock.resend.mockResolvedValue({ error: null })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
  expect(await screen.findByText('Confirme seu e-mail antes de entrar')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' }))

  expect(authMock.resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'ana@exemplo.com' }))
  expect(await screen.findByText('E-mail reenviado')).toBeInTheDocument()
})

test('deveGuardarAEscolhaDeManterConectado', async () => {
  authMock.signInWithPassword.mockResolvedValue({ error: null })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByLabelText('Manter conectado'))
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  await screen.findByText('tela inicial')
  expect(localStorage.getItem('fisiotech.manter-conectado')).toBe('1')
})

test('deveNaoManterConectadoPorPadrao', async () => {
  authMock.signInWithPassword.mockResolvedValue({ error: null })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  await screen.findByText('tela inicial')
  expect(localStorage.getItem('fisiotech.manter-conectado')).toBe('0')
})

test('deveLevarQuemJaTemSessaoParaOInicio', () => {
  estado.sessao = { access_token: 'x' }
  renderizar()

  expect(screen.getByText('tela inicial')).toBeInTheDocument()
})

test('deveOferecerCriarContaEEsqueciASenha', async () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute('href', '/esqueci-senha')
  expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/cadastro')
})

test('deveRenderizarSemViolacoesDeAcessibilidade', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})
