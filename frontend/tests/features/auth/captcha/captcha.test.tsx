import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LoginPage } from '../login/LoginPage'
import { MENSAGEM_CAPTCHA, useCaptcha } from './captcha'

const { authMock, turnstile } = vi.hoisted(() => ({
  authMock: { signInWithPassword: vi.fn(), resend: vi.fn() },
  turnstile: { render: vi.fn(), remove: vi.fn() },
}))

vi.mock('../../../shared/api/supabase', () => ({
  supabase: { auth: authMock },
  urlDeRetornoAuth: () => 'http://localhost/auth/callback',
}))
vi.mock('../../../shared/auth/useAuth', () => ({ useAuth: () => ({ sessao: null, carregando: false, sair: vi.fn() }) }))

function Sonda() {
  const captcha = useCaptcha()
  return (
    <>
      <p>{captcha.ativo ? 'ativo' : 'desligado'}</p>
      <p>token: {captcha.token ?? 'nenhum'}</p>
      <button onClick={captcha.renovar}>renovar</button>
      {captcha.campo}
    </>
  )
}

function renderizarLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

async function preencherLogin() {
  await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'SenhaForte1!')
}

let opcoes: Record<string, (token?: string) => void>

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  authMock.signInWithPassword.mockResolvedValue({ error: { code: 'invalid_credentials' } })
  turnstile.render.mockImplementation((_el: HTMLElement, o: typeof opcoes & Record<string, unknown>) => {
    opcoes = o
    return 'widget-1'
  })
  window.turnstile = turnstile
})

afterEach(() => {
  vi.unstubAllEnvs()
  delete window.turnstile
})

test('deveFicarDesligadoSemSiteKey', () => {
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
  render(<Sonda />)

  expect(screen.getByText('desligado')).toBeInTheDocument()
  expect(turnstile.render).not.toHaveBeenCalled()
})

test('deveMostrarOWidgetEGuardarOTokenResolvido', async () => {
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'chave-publica')
  render(<Sonda />)

  await vi.waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
  expect(turnstile.render.mock.calls[0][1]).toMatchObject({ sitekey: 'chave-publica', language: 'pt-br' })

  act(() => opcoes.callback('token-123'))
  expect(screen.getByText('token: token-123')).toBeInTheDocument()

  act(() => opcoes['expired-callback']())
  expect(screen.getByText('token: nenhum')).toBeInTheDocument()
})

test('devePedirOutroTokenAoRenovar', async () => {
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'chave-publica')
  render(<Sonda />)
  await vi.waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
  act(() => opcoes.callback('token-1'))

  await userEvent.click(screen.getByRole('button', { name: 'renovar' }))

  await vi.waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(2))
  expect(turnstile.remove).toHaveBeenCalledWith('widget-1')
  expect(screen.getByText('token: nenhum')).toBeInTheDocument()
})

describe('login com CAPTCHA ligado', () => {
  beforeEach(() => vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'chave-publica'))

  test('naoDeveEntrarSemOTokenDoCaptcha', async () => {
    renderizarLogin()
    await preencherLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText(MENSAGEM_CAPTCHA)).toBeInTheDocument()
    expect(authMock.signInWithPassword).not.toHaveBeenCalled()
  })

  test('deveEnviarOTokenAoSupabase', async () => {
    renderizarLogin()
    await vi.waitFor(() => expect(turnstile.render).toHaveBeenCalled())
    act(() => opcoes.callback('token-ok'))
    await preencherLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(authMock.signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      password: 'SenhaForte1!',
      options: { captchaToken: 'token-ok' },
    })
  })
})
