import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { CadastroPage } from '@/features/auth/cadastro/CadastroPage'
import { renderComRotas } from '../../../renderComRotas'

const { authMock, estado } = vi.hoisted(() => ({
  authMock: { signUp: vi.fn(), resend: vi.fn() },
  estado: { sessao: null as object | null },
}))

vi.mock('@/shared/api/supabase', () => ({
  supabase: { auth: authMock },
  urlDeRetornoAuth: () => `${window.location.origin}/auth/callback`,
}))
vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: () => ({ sessao: estado.sessao, carregando: false, sair: vi.fn() }),
}))

function renderizar() {
  return renderComRotas(
    <>
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/login" element={<p>tela de login</p>} />
      <Route path="/" element={<p>tela inicial</p>} />
    </>,
    '/cadastro',
  )
}

async function preencherEtapa1(sobrescrever: Partial<Record<'nome' | 'email' | 'senha' | 'confirmacao', string>> = {}) {
  const v = { nome: 'Ana Souza', email: 'ana@exemplo.com', senha: 'SenhaForte1!', confirmacao: 'SenhaForte1!', ...sobrescrever }
  await userEvent.type(screen.getByLabelText('Nome completo'), v.nome)
  await userEvent.type(screen.getByLabelText('E-mail'), v.email)
  await userEvent.type(screen.getByLabelText('Senha'), v.senha)
  await userEvent.type(screen.getByLabelText('Confirme a senha'), v.confirmacao)
  await userEvent.click(screen.getByLabelText(/Li e aceito/))
}

async function irParaEtapa2() {
  await preencherEtapa1()
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
  await screen.findByText('Etapa 2 de 2 · Seu perfil')
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.sessao = null
  authMock.signUp.mockResolvedValue({ error: null })
  authMock.resend.mockResolvedValue({ error: null })
})

test('deveMostrarOsErrosDaEtapa1JuntoAosCampos', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(await screen.findByText('Informe seu nome completo')).toBeInTheDocument()
  expect(screen.getByText('Informe seu e-mail')).toBeInTheDocument()
  expect(screen.getByText('Informe a senha')).toBeInTheDocument()
  expect(screen.getAllByText('Confirme a senha')).toHaveLength(2)
  expect(screen.getByText('Aceite os termos de uso e a política de privacidade')).toBeInTheDocument()
  expect(screen.getByText('Etapa 1 de 2 · Seus dados')).toBeInTheDocument()
})

test('deveAvisarQueAsSenhasNaoCoincidem', async () => {
  renderizar()

  await preencherEtapa1({ confirmacao: 'OutraSenha1!' })
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument()
  expect(screen.queryByText('Etapa 2 de 2 · Seu perfil')).not.toBeInTheDocument()
})

test('deveMarcarOsRequisitosDaSenhaEmTempoReal', async () => {
  renderizar()
  const requisitos = screen.getByRole('list', { name: 'Requisitos da senha' })
  expect(requisitos).toHaveTextContent('Mínimo de 10 caracteres (pendente)')

  await userEvent.type(screen.getByLabelText('Senha'), 'Abc1!')
  expect(requisitos).toHaveTextContent('Uma letra maiúscula (atendido)')
  expect(requisitos).toHaveTextContent('Um símbolo, como ! ou # (atendido)')
  expect(requisitos).toHaveTextContent('Mínimo de 10 caracteres (pendente)')

  await userEvent.type(screen.getByLabelText('Senha'), 'defgh')
  expect(requisitos).toHaveTextContent('Mínimo de 10 caracteres (atendido)')
})

test('deveMostrarExemplosDeSenhaForte', () => {
  renderizar()

  expect(screen.getByText(/Cafe-Bicicleta-Lua7!/)).toBeInTheDocument()
  expect(screen.getByText(/não use estes/i)).toBeInTheDocument()
})

test('deveExplicarPorQueASenhaEPrevisivelEmTempoReal', async () => {
  renderizar()
  expect(screen.queryByText(/Está muito previsível|semelhante a uma senha/)).not.toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('Senha'), 'Senha@12345')
  expect(await screen.findByText(/semelhante a uma senha comumente usada|Está muito previsível/)).toBeInTheDocument()
})

test('deveAvancarParaAEtapa2QuandoAEtapa1EstaValida', async () => {
  renderizar()

  await irParaEtapa2()

  expect(screen.getByText('Qual é o seu perfil?')).toBeInTheDocument()
  expect(authMock.signUp).not.toHaveBeenCalled()
})

test('deveExigirOPerfilNaEtapa2', async () => {
  renderizar()
  await irParaEtapa2()

  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText('Escolha seu perfil')).toBeInTheDocument()
  expect(authMock.signUp).not.toHaveBeenCalled()
})

test('deveCadastrarEstudanteEMostrarAVerificacao', async () => {
  renderizar()
  await irParaEtapa2()

  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UniBH')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '5')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText('Verifique seu e-mail')).toBeInTheDocument()
  expect(authMock.signUp).toHaveBeenCalledWith({
    email: 'ana@exemplo.com',
    password: 'SenhaForte1!',
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { cadastro: { nome: 'Ana Souza', aceiteTermos: true, perfil: 'ESTUDANTE', instituicao: 'UniBH', periodo: 5 } },
    },
  })
  expect(screen.getByText('ana@exemplo.com')).toBeInTheDocument()
})

test('deveCadastrarProfissionalNormalizandoORegistro', async () => {
  renderizar()
  await irParaEtapa2()

  await userEvent.click(screen.getByRole('radio', { name: /Profissional/ }))
  await userEvent.selectOptions(screen.getByLabelText('Categoria profissional'), 'FISIOTERAPEUTA')
  await userEvent.type(screen.getByLabelText('Número do registro'), '123456-f')
  await userEvent.selectOptions(screen.getByLabelText('UF do registro'), 'MG')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  await screen.findByText('Verifique seu e-mail')
  expect(authMock.signUp.mock.calls[0][0].options.data.cadastro).toEqual({
    nome: 'Ana Souza',
    aceiteTermos: true,
    perfil: 'PROFISSIONAL',
    categoria: 'FISIOTERAPEUTA',
    registro: '123456-F',
    uf: 'MG',
  })
})

test('devePermitirDigitarQualquerInstituicao', async () => {
  renderizar()
  await irParaEtapa2()
  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'Faculdade X')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '5')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  await screen.findByText('Verifique seu e-mail')
  expect(authMock.signUp.mock.calls[0][0].options.data.cadastro.instituicao).toBe('Faculdade X')
})

test('deveMostrarOFormatoEEsperadoDoRegistroPorCategoria', async () => {
  renderizar()
  await irParaEtapa2()
  await userEvent.click(screen.getByRole('radio', { name: /Profissional/ }))

  await userEvent.selectOptions(screen.getByLabelText('Categoria profissional'), 'TERAPEUTA_OCUPACIONAL')
  expect(screen.getByText(/Formato: 123456-TO/)).toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('Número do registro'), '123')
  await userEvent.selectOptions(screen.getByLabelText('UF do registro'), 'MG')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText('Use o formato 123456-TO')).toBeInTheDocument()
  expect(authMock.signUp).not.toHaveBeenCalled()
})

test('deveVoltarParaAEtapa1SemPerderOQueFoiDigitado', async () => {
  renderizar()
  await irParaEtapa2()

  await userEvent.click(screen.getByRole('button', { name: /Voltar/ }))

  expect(await screen.findByText('Etapa 1 de 2 · Seus dados')).toBeInTheDocument()
  expect(screen.getByLabelText('E-mail')).toHaveValue('ana@exemplo.com')
})

test('deveMostrarAMesmaTelaQuandoOEmailJaTemConta', async () => {
  authMock.signUp.mockResolvedValue({ error: { code: 'user_already_exists' } })
  renderizar()
  await irParaEtapa2()
  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UniBH')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '5')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText('Verifique seu e-mail')).toBeInTheDocument()
  expect(screen.getByText(/ainda não tem conta/)).toBeInTheDocument()
})

test('deveMostrarErroQuandoOSupabaseRecusaASenha', async () => {
  authMock.signUp.mockResolvedValue({ error: { code: 'weak_password' } })
  renderizar()
  await irParaEtapa2()
  await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
  await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UniBH')
  await userEvent.selectOptions(screen.getByLabelText('Período'), '5')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText(/não atende à política/)).toBeInTheDocument()
  expect(screen.queryByText('Verifique seu e-mail')).not.toBeInTheDocument()
})

describe('verificação do e-mail', () => {
  async function chegarNaVerificacao() {
    renderizar()
    await irParaEtapa2()
    await userEvent.click(screen.getByRole('radio', { name: /Estudante/ }))
    await userEvent.type(screen.getByLabelText('Instituição de ensino'), 'UniBH')
    await userEvent.selectOptions(screen.getByLabelText('Período'), '5')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    await screen.findByText('Verifique seu e-mail')
  }

  test('deveEsperarAContagemAntesDeReenviar', async () => {
    await chegarNaVerificacao()

    const botao = screen.getByRole('button', { name: /Reenviar e-mail em 01:00/ })
    expect(botao).toBeDisabled()
  })

  test('devePermitirReenviarDepoisDaContagem', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      await chegarNaVerificacao()

      for (let i = 0; i < 61; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000)
        })
      }
      await userEvent.click(screen.getByRole('button', { name: 'Reenviar e-mail' }))

      expect(authMock.resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'ana@exemplo.com' }))
      expect(await screen.findByText('E-mail reenviado')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Reenviar e-mail em/ })).toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })

  test('devePermitirAlterarOEmail', async () => {
    await chegarNaVerificacao()

    await userEvent.click(screen.getByRole('button', { name: 'Alterar e-mail' }))

    expect(await screen.findByText('Etapa 1 de 2 · Seus dados')).toBeInTheDocument()
  })
})

test('deveLevarParaOLoginPeloVoltarDaEtapa1', () => {
  renderizar()

  expect(screen.getByRole('link', { name: /Voltar/ })).toHaveAttribute('href', '/login')
  expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
})

test('deveAbrirOsTermosEmOutraAbaSemPerderOFormulario', () => {
  renderizar()

  expect(screen.getAllByRole('link', { name: 'Termos de uso' })[0]).toHaveAttribute('target', '_blank')
  expect(screen.getAllByRole('link', { name: 'Política de privacidade' })[0]).toHaveAttribute('href', '/privacidade')
})

test('deveLevarQuemJaTemSessaoParaOInicio', () => {
  estado.sessao = { access_token: 'x' }
  renderizar()

  expect(screen.getByText('tela inicial')).toBeInTheDocument()
})

test('deveRenderizarAEtapa1SemViolacoesDeAcessibilidade', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})

test('deveRenderizarAEtapa2SemViolacoesDeAcessibilidade', async () => {
  const { container } = renderizar()
  await irParaEtapa2()
  await userEvent.click(screen.getByRole('radio', { name: /Profissional/ }))

  expect(await axe(container)).toHaveNoViolations()
})

test('deveOferecerCadastroPeloGoogleNaEtapa1', () => {
  renderizar()

  expect(screen.getByRole('button', { name: 'Continuar com o Google' })).toBeInTheDocument()
})
