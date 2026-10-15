import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { BuscaRapida } from '@/app/BuscaRapida'
import { renderComRotas } from '../renderComRotas'

const aoSair = vi.fn()

function renderizar(perfil: 'ESTUDANTE' | 'PROFISSIONAL' = 'ESTUDANTE') {
  return renderComRotas(
    <>
      <Route path="/" element={<BuscaRapida perfil={perfil} aoSair={aoSair} />} />
      <Route path="/tens" element={<p>página do TENS</p>} />
      <Route path="/pacientes" element={<p>página de pacientes</p>} />
    </>,
    '/',
  )
}

async function abrir() {
  const usuario = userEvent.setup()
  await usuario.click(screen.getByRole('button', { name: 'Busca rápida' }))
  return usuario
}

beforeEach(() => vi.clearAllMocks())

test('deveAbrirPeloBotao', async () => {
  renderizar()
  await abrir()

  expect(screen.getByRole('dialog', { name: 'Busca rápida' })).toBeInTheDocument()
  expect(screen.getByRole('searchbox', { name: 'Buscar módulo ou ação' })).toHaveFocus()
})

test('deveAbrirComCtrlK', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await usuario.keyboard('{Control>}k{/Control}')

  expect(screen.getByRole('dialog', { name: 'Busca rápida' })).toBeInTheDocument()
})

test('deveFiltrarEIrParaOModuloComEnter', async () => {
  renderizar()
  const usuario = await abrir()

  await usuario.keyboard('tens{Enter}')

  expect(screen.getByText('página do TENS')).toBeInTheDocument()
})

test('deveIrParaOModuloAoClicar', async () => {
  renderizar()
  const usuario = await abrir()

  await usuario.click(screen.getByRole('button', { name: /TENS/ }))

  expect(screen.getByText('página do TENS')).toBeInTheDocument()
})

test('deveExecutarAcaoSair', async () => {
  renderizar()
  const usuario = await abrir()

  await usuario.keyboard('sair{Enter}')

  expect(aoSair).toHaveBeenCalledTimes(1)
})

test('deveEsconderPacientesDoEstudante', async () => {
  renderizar('ESTUDANTE')
  await abrir()

  expect(screen.queryByRole('button', { name: /Pacientes/ })).not.toBeInTheDocument()
})

test('deveMostrarPacientesAoProfissional', async () => {
  renderizar('PROFISSIONAL')
  const usuario = await abrir()

  await usuario.keyboard('pacientes{Enter}')

  expect(screen.getByText('página de pacientes')).toBeInTheDocument()
})

test('deveAvisarQuandoNaoHaResultado', async () => {
  renderizar()
  const usuario = await abrir()

  await usuario.keyboard('zzzz')

  expect(screen.getByText('Nada encontrado.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /TENS/ })).not.toBeInTheDocument()
})

test('deveSerAcessivelSemViolacoes', async () => {
  renderizar()
  await abrir()

  expect(await axe(document.body)).toHaveNoViolations()
})
