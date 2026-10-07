import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { BotaoGoogle } from '@/features/auth/login/BotaoGoogle'

const { signInWithOAuth } = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }))

vi.mock('@/shared/api/supabase', () => ({
  supabase: { auth: { signInWithOAuth } },
  urlDeRetornoAuth: () => `${window.location.origin}/auth/callback`,
}))

function renderizar(antes?: () => void) {
  return render(
    <MemoryRouter>
      <BotaoGoogle antes={antes} />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  signInWithOAuth.mockResolvedValue({ error: null })
})

test('deveAbrirOGoogleVoltandoParaOCallback', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))

  expect(signInWithOAuth).toHaveBeenCalledWith({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
})

test('deveRodarAAcaoPrevistaAntesDeSairDaPagina', async () => {
  const antes = vi.fn()
  renderizar(antes)

  await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))

  expect(antes).toHaveBeenCalledTimes(1)
  expect(antes.mock.invocationCallOrder[0]).toBeLessThan(signInWithOAuth.mock.invocationCallOrder[0])
})

test('deveAvisarQuandoNaoConseguirAbrirOGoogle', async () => {
  signInWithOAuth.mockResolvedValue({ error: { code: 'provider_disabled' } })
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: 'Continuar com o Google' }))

  expect(await screen.findByText('Não foi possível abrir o Google')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continuar com o Google' })).toBeEnabled()
})

test('deveLembrarQueOAceiteValeParaTermosEPrivacidade', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute('href', '/termos')
  expect(screen.getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute('href', '/privacidade')
})

test('deveSerAcessivel', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})
