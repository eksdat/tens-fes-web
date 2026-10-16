import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { axe } from 'vitest-axe'
import { FES } from '@/features/fes/conteudoFes'
import { rotasDoModulo } from '@/features/modulo/rotasDoModulo'
import { TENS } from '@/features/tens/conteudoTens'
import type { Modulo } from '@/features/modulo/tipos'

function renderizar(modulo: Modulo, rota: string) {
  const roteador = createMemoryRouter([{ element: <main><Outlet /></main>, children: [rotasDoModulo(modulo)] }], {
    initialEntries: [rota],
  })
  return render(<RouterProvider router={roteador} />)
}

test.each([
  [TENS, '/tens/parametros', '/simulador?modalidade=TENS&modo=Convencional'],
  [TENS, '/tens/casos', '/simulador?modalidade=TENS&modo=Convencional'],
  [FES, '/fes/parametros', '/simulador?modalidade=FES&modo=FES'],
  [FES, '/fes/casos', '/simulador?modalidade=FES&modo=FES'],
])('deveLevarAoSimuladorDaModalidade (%#)', (modulo, rota, destino) => {
  renderizar(modulo, rota)

  expect(screen.getByRole('link', { name: 'Testar no simulador' })).toHaveAttribute('href', destino)
})

test('deveListarOsCasosDoTensNaOrdemDoGuia', () => {
  renderizar(TENS, '/tens/casos')

  const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent).filter((t) => t?.startsWith('Caso'))
  expect(titulos).toEqual(['Caso 1 · Dor localizada e TENS', 'Caso 4 · Queimação sob o eletrodo'])
})

test('deveListarOsCasosDoFes', () => {
  renderizar(FES, '/fes/casos')

  const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent).filter((t) => t?.startsWith('Caso'))
  expect(titulos).toEqual([
    'Caso 2 · Contração de quadríceps',
    'Caso 3 · Pé caído',
    'Caso 4 · Queimação sob o eletrodo',
  ])
})

test('deveEsconderARespostaAteAPessoaPedir', () => {
  renderizar(FES, '/fes/casos')

  expect(screen.queryByText(/Contração isolada caracteriza NMES/)).not.toBeInTheDocument()
  for (const botao of screen.getAllByRole('button', { name: 'Ver a resposta' })) {
    expect(botao).toHaveAttribute('aria-expanded', 'false')
  }
})

test('deveMostrarEOcultarARespostaDoCaso', async () => {
  renderizar(FES, '/fes/casos')
  const usuario = userEvent.setup()
  const caso = within(screen.getByRole('article', { name: 'Caso 2 · Contração de quadríceps' }))

  await usuario.click(caso.getByRole('button', { name: 'Ver a resposta' }))
  expect(caso.getByText('Contração isolada caracteriza NMES no contexto apresentado.')).toBeInTheDocument()
  expect(caso.getByRole('button', { name: 'Ocultar a resposta' })).toHaveAttribute('aria-expanded', 'true')

  await usuario.click(caso.getByRole('button', { name: 'Ocultar a resposta' }))
  expect(caso.queryByText(/Contração isolada caracteriza NMES/)).not.toBeInTheDocument()
})

test('deveListarOQueAPessoaDevePerguntarNoCasoDoPeCaido', async () => {
  renderizar(FES, '/fes/casos')
  const usuario = userEvent.setup()
  const caso = within(screen.getByRole('article', { name: 'Caso 3 · Pé caído' }))

  await usuario.click(caso.getByRole('button', { name: 'Ver a resposta' }))

  expect(caso.getByText('Faltam dados para propor uma configuração funcional.')).toBeInTheDocument()
  expect(caso.getByText('Segurança da marcha')).toBeInTheDocument()
  expect(caso.getByText(/Não recomende simplesmente “aumentar Hz”/)).toBeInTheDocument()
})

test('deveNaoPedirParaCopiarMiliamperagemNoCasoDoTens', async () => {
  renderizar(TENS, '/tens/casos')
  const usuario = userEvent.setup()
  const caso = within(screen.getByRole('article', { name: 'Caso 1 · Dor localizada e TENS' }))

  await usuario.click(caso.getByRole('button', { name: 'Ver a resposta' }))

  expect(caso.getByText(/não pode ser definida copiando o mA de outro caso/)).toBeInTheDocument()
})

test('deveAvisarConteudoNaoLiberadoQuandoOModuloNaoTemCasos', () => {
  renderizar({ ...TENS, casos: undefined }, '/tens/casos')

  expect(screen.getByText('Conteúdo ainda não liberado')).toBeInTheDocument()
})

test.each([
  ['/tens/casos', TENS],
  ['/fes/casos', FES],
])('deveSerAcessivelSemViolacoesEm_%s', async (rota, modulo) => {
  renderizar(modulo, rota)

  expect(await axe(document.body)).toHaveNoViolations()
})

test('deveTerPerguntasFrequentesNaVisaoGeralDoFes', () => {
  renderizar(FES, '/fes')

  expect(screen.getByRole('heading', { name: 'Perguntas frequentes' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'FES e NMES são a mesma coisa?' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('button', { name: 'Posso aumentar a corrente se o músculo não contrai?' })).toBeInTheDocument()
})
