import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { AtivarMfaPage } from '@/features/mfa/AtivarMfaPage'
import { VerificarMfaPage } from '@/features/mfa/VerificarMfaPage'
import { renderComRotas } from '../../renderComRotas'

const { mfa, estado, sair } = vi.hoisted(() => ({
  mfa: {
    listFactors: vi.fn(),
    enroll: vi.fn(),
    unenroll: vi.fn(),
    challengeAndVerify: vi.fn(),
    refreshSession: vi.fn(),
  },
  estado: {
    nivel: { atual: 'aal1', proximo: 'aal2', fatorId: 'f1' } as { atual: string; proximo: string; fatorId?: string },
    perfil: 'ESTUDANTE' as 'ESTUDANTE' | 'PROFISSIONAL',
  },
  sair: vi.fn(),
}))

vi.mock('@/shared/api/supabase', () => ({ supabase: { auth: { mfa, refreshSession: mfa.refreshSession } } }))
vi.mock('@/shared/auth/useAuth', () => ({ useAuth: () => ({ sessao: {}, carregando: false, sair }) }))
vi.mock('@/features/mfa/useNivelMfa', () => ({ useNivelMfa: () => estado.nivel }))
vi.mock('@/features/usuario/useUsuarioAtual', () => ({ useUsuarioAtual: () => ({ data: { perfil: estado.perfil } }) }))

function renderizar(pagina: React.ReactNode) {
  return renderComRotas(
    <>
      <Route path="/mfa" element={pagina} />
      <Route path="/" element={<p>tela inicial</p>} />
    </>,
    '/mfa',
  )
}

const fatorAtivo = { id: 'f1', factor_type: 'totp', status: 'verified' }

beforeEach(() => {
  vi.clearAllMocks()
  estado.nivel = { atual: 'aal1', proximo: 'aal2', fatorId: 'f1' }
  estado.perfil = 'ESTUDANTE'
  mfa.listFactors.mockResolvedValue({ data: { totp: [fatorAtivo], all: [fatorAtivo] }, error: null })
  mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null })
  mfa.unenroll.mockResolvedValue({ error: null })
  mfa.enroll.mockResolvedValue({
    data: { id: 'novo', totp: { qr_code: 'data:image/svg+xml;utf-8,<svg/>', secret: 'ABCDEF123456' } },
    error: null,
  })
})

describe('verificar código no login', () => {
  test('deveValidarOCodigoComSeisNumeros', async () => {
    renderizar(<VerificarMfaPage />)

    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '12ab')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(await screen.findByText('Digite os 6 números do aplicativo')).toBeInTheDocument()
    expect(mfa.challengeAndVerify).not.toHaveBeenCalled()
  })

  test('deveVerificarOCodigoELevarAoInicio', async () => {
    renderizar(<VerificarMfaPage />)

    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(await screen.findByText('tela inicial')).toBeInTheDocument()
    expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f1', code: '123456' })
  })

  test('deveAvisarQuandoOCodigoEstaErrado', async () => {
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { code: 'mfa_verification_failed' } })
    renderizar(<VerificarMfaPage />)

    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '000000')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(await screen.findByText(/Código incorreto ou vencido/)).toBeInTheDocument()
    expect(screen.queryByText('tela inicial')).not.toBeInTheDocument()
  })

  test('deveLevarAoInicioQuandoNaoHaNadaParaVerificar', () => {
    estado.nivel = { atual: 'aal2', proximo: 'aal2', fatorId: 'f1' }
    renderizar(<VerificarMfaPage />)

    expect(screen.getByText('tela inicial')).toBeInTheDocument()
  })

  test('devePermitirSairSemVerificar', async () => {
    renderizar(<VerificarMfaPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(sair).toHaveBeenCalledTimes(1)
  })

  test('deveSerAcessivel', async () => {
    const { container } = renderizar(<VerificarMfaPage />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ativar autenticador', () => {
  beforeEach(() => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [], all: [] }, error: null })
  })

  test('deveMostrarQrCodeEChaveManual', async () => {
    renderizar(<AtivarMfaPage />)

    expect(await screen.findByAltText(/QR code/)).toHaveAttribute('src', 'data:image/svg+xml;utf-8,<svg/>')
    expect(screen.getByText('ABCDEF123456')).toBeInTheDocument()
    expect(mfa.enroll).toHaveBeenCalledWith({ factorType: 'totp', friendlyName: 'Fisiotech', issuer: 'Fisiotech' })
  })

  test('deveRemoverFatorIniciadoENuncaConfirmadoAntesDeCriarOutro', async () => {
    const pendente = { id: 'velho', factor_type: 'totp', status: 'unverified' }
    mfa.listFactors.mockResolvedValue({ data: { totp: [], all: [pendente] }, error: null })
    renderizar(<AtivarMfaPage />)

    await screen.findByAltText(/QR code/)
    expect(mfa.unenroll).toHaveBeenCalledWith({ factorId: 'velho' })
  })

  test('deveAtivarComOCodigoDoAplicativo', async () => {
    renderizar(<AtivarMfaPage />)

    await screen.findByAltText(/QR code/)
    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '654321')
    await userEvent.click(screen.getByRole('button', { name: 'Ativar verificação' }))

    expect(await screen.findByText('Verificação em duas etapas ativa')).toBeInTheDocument()
    expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'novo', code: '654321' })
  })

  test('deveManterATelaQuandoOCodigoEstaErrado', async () => {
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { code: 'mfa_verification_failed' } })
    renderizar(<AtivarMfaPage />)

    await screen.findByAltText(/QR code/)
    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '000000')
    await userEvent.click(screen.getByRole('button', { name: 'Ativar verificação' }))

    expect(await screen.findByText(/Código incorreto ou vencido/)).toBeInTheDocument()
    expect(screen.queryByText('Verificação em duas etapas ativa')).not.toBeInTheDocument()
  })

  test('deveAvisarQueEObrigatorioParaProfissional', async () => {
    estado.perfil = 'PROFISSIONAL'
    renderizar(<AtivarMfaPage />)

    expect(await screen.findByText(/obrigatório antes de usar/)).toBeInTheDocument()
  })

  test('deveMostrarComoAtivaQuemJaTemAutenticador', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [fatorAtivo], all: [fatorAtivo] }, error: null })
    renderizar(<AtivarMfaPage />)

    expect(await screen.findByText('Verificação em duas etapas ativa')).toBeInTheDocument()
    expect(mfa.enroll).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Desativar verificação' })).toBeInTheDocument()
  })

  test('naoDeveOferecerDesativarParaProfissional', async () => {
    estado.perfil = 'PROFISSIONAL'
    mfa.listFactors.mockResolvedValue({ data: { totp: [fatorAtivo], all: [fatorAtivo] }, error: null })
    renderizar(<AtivarMfaPage />)

    await screen.findByText('Verificação em duas etapas ativa')
    expect(screen.queryByRole('button', { name: 'Desativar verificação' })).not.toBeInTheDocument()
  })

  test('deveSerAcessivel', async () => {
    const { container } = renderizar(<AtivarMfaPage />)
    await screen.findByAltText(/QR code/)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('botão Voltar', () => {
  test('deveVoltarAoInicioNaAtivacaoOpcional', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [], all: [] }, error: null })
    renderizar(<AtivarMfaPage />)
    await screen.findByAltText(/QR code/)

    expect(screen.getByRole('link', { name: /Voltar/ })).toHaveAttribute('href', '/')
  })

  test('deveSairQuandoAAtivacaoEObrigatoria', async () => {
    estado.perfil = 'PROFISSIONAL'
    mfa.listFactors.mockResolvedValue({ data: { totp: [], all: [] }, error: null })
    renderizar(<AtivarMfaPage />)
    await screen.findByAltText(/QR code/)

    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }))

    expect(sair).toHaveBeenCalledTimes(1)
  })

  test('deveSairAoVoltarDaVerificacaoDoLogin', async () => {
    renderizar(<VerificarMfaPage />)

    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }))

    expect(sair).toHaveBeenCalledTimes(1)
  })
})

describe('desativar e trocar de aparelho', () => {
  beforeEach(() => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [fatorAtivo], all: [fatorAtivo] }, error: null })
    mfa.refreshSession.mockResolvedValue({})
  })

  async function abrirConfirmacao(botao: string) {
    renderizar(<AtivarMfaPage />)
    await userEvent.click(await screen.findByRole('button', { name: botao }))
  }

  test('deveExigirOCodigoAntesDeDesativar', async () => {
    await abrirConfirmacao('Desativar verificação')

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar e desativar' }))

    expect(await screen.findByText('Digite os 6 números do aplicativo')).toBeInTheDocument()
    expect(mfa.unenroll).not.toHaveBeenCalled()
  })

  test('naoDeveDesativarComCodigoErrado', async () => {
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { code: 'mfa_verification_failed' } })
    await abrirConfirmacao('Desativar verificação')

    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '000000')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar e desativar' }))

    expect(await screen.findByText(/Código incorreto ou vencido/)).toBeInTheDocument()
    expect(mfa.unenroll).not.toHaveBeenCalled()
  })

  test('deveDesativarDepoisDeConfirmarOCodigo', async () => {
    await abrirConfirmacao('Desativar verificação')

    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar e desativar' }))

    expect(await screen.findByText('tela inicial')).toBeInTheDocument()
    expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f1', code: '123456' })
    expect(mfa.unenroll).toHaveBeenCalledWith({ factorId: 'f1' })
    expect(mfa.refreshSession).toHaveBeenCalled()
  })

  test('devePermitirCancelarSemMexerNoAutenticador', async () => {
    await abrirConfirmacao('Desativar verificação')

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Desativar verificação' })).toBeInTheDocument()
    expect(mfa.unenroll).not.toHaveBeenCalled()
  })

  test('deveTrocarDeAparelhoMostrandoUmNovoQrCode', async () => {
    mfa.listFactors
      .mockResolvedValueOnce({ data: { totp: [fatorAtivo], all: [fatorAtivo] }, error: null })
      .mockResolvedValue({ data: { totp: [], all: [] }, error: null })
    await abrirConfirmacao('Trocar de aparelho')

    await userEvent.type(screen.getByLabelText('Dígito 1 de 6'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar e trocar' }))

    expect(await screen.findByAltText(/QR code/)).toBeInTheDocument()
    expect(mfa.unenroll).toHaveBeenCalledWith({ factorId: 'f1' })
    expect(mfa.enroll).toHaveBeenCalledTimes(1)
  })

  test('deveOferecerTrocarMasNaoDesativarParaProfissional', async () => {
    estado.perfil = 'PROFISSIONAL'
    renderizar(<AtivarMfaPage />)

    expect(await screen.findByRole('button', { name: 'Trocar de aparelho' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Desativar verificação' })).not.toBeInTheDocument()
  })
})
