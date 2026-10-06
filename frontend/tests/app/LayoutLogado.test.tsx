import { screen, within } from '@testing-library/react'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../test/renderComRotas'
import { LayoutLogado } from './LayoutLogado'

vi.mock('../shared/auth/useAuth', () => ({ useAuth: () => ({ sair: vi.fn() }) }))
vi.mock('../features/usuario/useUsuarioAtual', () => ({
  useUsuarioAtual: () => ({ data: { perfil: 'ESTUDANTE' } }),
}))

function renderizar() {
  return renderComRotas(
    <Route element={<LayoutLogado />}>
      <Route path="/" element={<h1>Tela de teste</h1>} />
    </Route>,
    '/',
  )
}

test('deveMostrarOMenuEAPaginaNoMesmoLayout', () => {
  renderizar()

  expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Tela de teste' })).toBeInTheDocument()
})

test('deveOferecerOConteudoComoAlvoDoLinkPular', () => {
  renderizar()

  const principal = screen.getByRole('main')
  expect(principal).toHaveAttribute('id', 'conteudo')
  expect(principal).toHaveAttribute('tabindex', '-1')
})

test('deveTerUmSoLandmarkMain', () => {
  renderizar()

  expect(screen.getAllByRole('main')).toHaveLength(1)
})

test('deveSerAcessivel', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})
