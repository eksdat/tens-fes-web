import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../renderComRotas'
import { MenuPrincipal } from '@/app/MenuPrincipal'

const { estado, sair } = vi.hoisted(() => ({
  estado: { perfil: 'ESTUDANTE' as 'ESTUDANTE' | 'PROFISSIONAL' },
  sair: vi.fn(),
}))

vi.mock('@/shared/auth/useAuth', () => ({ useAuth: () => ({ sair }) }))
vi.mock('@/features/usuario/useUsuarioAtual', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/usuario/useUsuarioAtual')>()),
  useUsuarioAtual: () => ({ data: { nome: 'Ana Souza', perfil: estado.perfil } }),
}))

const ABAS = [
  { rotulo: 'Início', para: '/' },
  { rotulo: 'TENS', para: '/tens' },
  { rotulo: 'Pacientes', para: '/pacientes', perfil: 'PROFISSIONAL' as const },
]

function renderizar(rota = '/') {
  return renderComRotas(<Route path="*" element={<MenuPrincipal abas={ABAS} />} />, rota)
}

function renderizarComAbasPadrao(rota = '/') {
  return renderComRotas(<Route path="*" element={<MenuPrincipal />} />, rota)
}

beforeEach(() => {
  vi.clearAllMocks()
  estado.perfil = 'ESTUDANTE'
})

test('deveExporOMenuComoNavegacaoPrincipal', () => {
  renderizar()

  expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
})

test('deveManterAOrdemDasAbas', () => {
  estado.perfil = 'PROFISSIONAL'
  renderizar()

  const nomes = screen.getAllByRole('link', { name: /Início|TENS|Pacientes/ }).map((l) => l.textContent)
  expect(nomes).toEqual(['Início', 'TENS', 'Pacientes'])
})

test('deveMarcarSoAAbaAtual', () => {
  renderizar('/tens')

  expect(screen.getByRole('link', { name: 'TENS' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
})

test('deveManterAAbaMarcadaEmSubrota', () => {
  renderizar('/tens/ajustes')

  expect(screen.getByRole('link', { name: 'TENS' })).toHaveAttribute('aria-current', 'page')
})

test('deveEsconderAbaDeProfissionalParaEstudante', () => {
  renderizar()

  expect(screen.queryByRole('link', { name: 'Pacientes' })).not.toBeInTheDocument()
})

test('deveMostrarAbaDeProfissionalParaProfissional', () => {
  estado.perfil = 'PROFISSIONAL'
  renderizar()

  expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument()
})

test('deveMostrarONomeEOPerfilDaPessoaNoBotaoDeConta', () => {
  renderizar()

  const conta = screen.getByRole('button', { name: /Ana Souza/ })
  expect(conta).toHaveTextContent('Estudante')
  expect(conta).toHaveAttribute('aria-haspopup', 'menu')
})

test('deveMostrarOPerfilProfissional', () => {
  estado.perfil = 'PROFISSIONAL'
  renderizar()

  expect(screen.getByRole('button', { name: /Ana Souza/ })).toHaveTextContent('Profissional')
})

test('deveEsconderOSairAteAbrirOMenuDaConta', async () => {
  renderizar()
  expect(screen.queryByRole('menuitem', { name: 'Sair' })).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: /Ana Souza/ }))

  expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument()
})

test('deveListarAsAbasDoCard22NaOrdem', () => {
  renderizarComAbasPadrao()

  const nav = screen.getByRole('navigation', { name: 'Principal' })
  const nomes = within(nav).getAllByRole('listitem').map((i) => i.textContent)
  expect(nomes).toEqual(['Início', 'TENS', 'FES', 'Criar conteúdo'])
})

test('deveListarPacientesPorUltimoParaProfissional', () => {
  estado.perfil = 'PROFISSIONAL'
  renderizarComAbasPadrao()

  const nav = screen.getByRole('navigation', { name: 'Principal' })
  const nomes = within(nav).getAllByRole('listitem').map((i) => i.textContent)
  expect(nomes).toEqual(['Início', 'TENS', 'FES', 'Criar conteúdo', 'Pacientes'])
  expect(within(nav).getByRole('link', { name: 'Pacientes' })).toHaveAttribute('href', '/pacientes')
})

test('deveOferecerMeuPerfilDentroDoMenuDaConta', async () => {
  renderizarComAbasPadrao()
  expect(screen.queryByRole('menuitem', { name: 'Meu perfil' })).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: /Ana Souza/ }))

  expect(screen.getByRole('menuitem', { name: 'Meu perfil' })).toHaveAttribute('href', '/perfil')
  expect(screen.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Meu perfil', 'Sair'])
})

test('deveSairDaContaAoEscolherSair', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: /Ana Souza/ }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }))

  expect(sair).toHaveBeenCalledOnce()
})

test('deveAbrirOMenuDaContaPeloTeclado', async () => {
  renderizar()

  screen.getByRole('button', { name: /Ana Souza/ }).focus()
  await userEvent.keyboard('{Enter}')

  expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument()
})

test('deveFecharOMenuComEscEDevolverOFocoAoBotao', async () => {
  renderizar()
  const conta = screen.getByRole('button', { name: /Ana Souza/ })

  await userEvent.click(conta)
  await userEvent.keyboard('{Escape}')

  expect(screen.queryByRole('menuitem', { name: 'Sair' })).not.toBeInTheDocument()
  expect(conta).toHaveFocus()
})

test('deveSerAcessivel', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})

test('deveSerAcessivelComOMenuDaContaAberto', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: /Ana Souza/ }))

  expect(await axe(screen.getByRole('menu'))).toHaveNoViolations()
})
