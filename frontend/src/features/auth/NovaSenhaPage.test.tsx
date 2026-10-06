import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { axe } from 'vitest-axe'
import { NovaSenhaPage } from './NovaSenhaPage'

const { auth, estado } = vi.hoisted(() => ({
  auth: {
    updateUser: vi.fn(),
    mfa: { challengeAndVerify: vi.fn() },
  },
  estado: {
    sessao: {} as object | null,
    nivel: { atual: 'aal1', proximo: 'aal1' } as { atual: string; proximo: string; fatorId?: string },
  },
}))

vi.mock('../../shared/api/supabase', () => ({ supabase: { auth } }))
vi.mock('../../shared/auth/useAuth', () => ({ useAuth: () => ({ sessao: estado.sessao, carregando: false }) }))
vi.mock('../mfa/useNivelMfa', () => ({ useNivelMfa: () => estado.nivel }))

function renderizar() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/nova-senha']}>
        <Routes>
          <Route path="/nova-senha" element={<NovaSenhaPage />} />
          <Route path="/login" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function preencher(senha = 'SenhaNova1!') {
  await userEvent.type(screen.getByLabelText('Nova senha'), senha)
  await userEvent.type(screen.getByLabelText('Confirme a nova senha'), senha)
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.sessao = {}
  estado.nivel = { atual: 'aal1', proximo: 'aal1' }
  auth.updateUser.mockResolvedValue({ error: null })
  auth.mfa.challengeAndVerify.mockResolvedValue({ error: null })
})

test('deveSalvarANovaSenha', async () => {
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

  expect(await screen.findByText('Senha alterada')).toBeInTheDocument()
  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'SenhaNova1!' })
})

test('deveRecusarSenhaFacilDeAdivinharSemChamarOSupabase', async () => {
  renderizar()

  await preencher('Senha@12345')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

  expect(await screen.findByText(/Essa senha é fácil de adivinhar/)).toBeInTheDocument()
  expect(auth.updateUser).not.toHaveBeenCalled()
})

test('deveRecusarSenhaComPartesDoEmailDaConta', async () => {
  estado.sessao = { user: { email: 'ana.clara@exemplo.com' } }
  renderizar()

  await preencher('Xk#clara#91Z')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

  expect(await screen.findByText(/Essa senha é fácil de adivinhar/)).toBeInTheDocument()
  expect(auth.updateUser).not.toHaveBeenCalled()
})

test('deveAvisarQueANovaSenhaNaoPodeSerIgualAAtual', async () => {
  auth.updateUser.mockResolvedValue({ error: { code: 'same_password' } })
  renderizar()

  expect(screen.getByText(/não pode ser igual à senha atual\. Conferimos ao salvar/)).toBeInTheDocument()
  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

  expect(await screen.findByText('Escolha outra senha')).toBeInTheDocument()
  expect(screen.queryByText('Senha alterada')).not.toBeInTheDocument()
})

test('deveMostrarErroGenericoQuandoOSupabaseFalha', async () => {
  auth.updateUser.mockResolvedValue({ error: { code: 'unexpected_failure' } })
  renderizar()

  await preencher()
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

  expect(await screen.findByText('Não foi possível salvar')).toBeInTheDocument()
})

test('naoDevePedirCodigoQuemNaoTemAutenticador', () => {
  renderizar()

  expect(screen.queryByRole('group', { name: 'Código de 6 dígitos' })).not.toBeInTheDocument()
})

describe('conta com verificação em duas etapas', () => {
  beforeEach(() => {
    estado.nivel = { atual: 'aal1', proximo: 'aal2', fatorId: 'f1' }
  })

  test('deveVerificarOCodigoAntesDeTrocarASenha', async () => {
    renderizar()

    await preencher()
    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

    expect(await screen.findByText('Senha alterada')).toBeInTheDocument()
    expect(auth.mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f1', code: '123456' })
    expect(auth.mfa.challengeAndVerify.mock.invocationCallOrder[0]).toBeLessThan(
      auth.updateUser.mock.invocationCallOrder[0],
    )
  })

  test('deveExigirOCodigoCompleto', async () => {
    renderizar()

    await preencher()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

    expect(await screen.findByText('Digite os 6 números do aplicativo')).toBeInTheDocument()
    expect(auth.updateUser).not.toHaveBeenCalled()
  })

  test('deveNaoTrocarASenhaComCodigoErrado', async () => {
    auth.mfa.challengeAndVerify.mockResolvedValue({ error: { code: 'mfa_verification_failed' } })
    renderizar()

    await preencher()
    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '000000')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))

    expect(await screen.findByText('Código incorreto ou vencido')).toBeInTheDocument()
    expect(auth.updateUser).not.toHaveBeenCalled()
  })
})

test('deveOferecerVoltarParaOLogin', () => {
  renderizar()

  expect(screen.getByRole('link', { name: /Voltar/ })).toHaveAttribute('href', '/login')
})

test('deveSerAcessivel', async () => {
  estado.nivel = { atual: 'aal1', proximo: 'aal2', fatorId: 'f1' }
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})
