import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../test/renderComRotas'
import { MenuPrincipal } from './MenuPrincipal'

const { estado, sair } = vi.hoisted(() => ({
  estado: { perfil: 'ESTUDANTE' as 'ESTUDANTE' | 'PROFISSIONAL' },
  sair: vi.fn(),
}))

vi.mock('../shared/auth/useAuth', () => ({ useAuth: () => ({ sair }) }))
vi.mock('../features/usuario/useUsuarioAtual', () => ({
  useUsuarioAtual: () => ({ data: { perfil: estado.perfil } }),
}))

const ABAS = [
  { rotulo: 'Início', para: '/' },
  { rotulo: 'TENS', para: '/tens' },
  { rotulo: 'Pacientes', para: '/pacientes', perfil: 'PROFISSIONAL' as const },
]

function renderizar(rota = '/') {
  return renderComRotas(<Route path="*" element={<MenuPrincipal abas={ABAS} />} />, rota)
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

test('deveSairDaContaAoClicarEmSair', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

  expect(sair).toHaveBeenCalledOnce()
})

test('deveSerAcessivel', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})
