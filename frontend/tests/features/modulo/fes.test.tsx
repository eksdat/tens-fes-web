import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { axe } from 'vitest-axe'
import { ABAS_MODULO } from '@/features/modulo/abasModulo'
import { rotasDoModulo } from '@/features/modulo/rotasDoModulo'
import { FES } from '@/features/fes/conteudoFes'

vi.mock('@/features/modulo/usePaginaTecnica', () => import('./paginaTecnicaFalsa'))

function renderizar(rota: string) {
  const roteador = createMemoryRouter(
    [{ element: <main><Outlet /></main>, children: [rotasDoModulo(FES)] }],
    { initialEntries: [rota] },
  )
  return render(<RouterProvider router={roteador} />)
}

test('deveTerAsMesmasAbasNaMesmaOrdemDoTens', () => {
  renderizar('/fes')

  const abas = within(screen.getByRole('navigation', { name: 'Seções de FES' })).getAllByRole('link')
  expect(abas.map((a) => a.textContent)).toEqual(ABAS_MODULO.map((a) => a.rotulo))
})

test('deveAbrirNaVisaoGeralComOTituloDoModulo', () => {
  renderizar('/fes')

  expect(screen.getByText('Módulo 02 · FES')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'Movimento e função' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: 'Visão geral' })).toBeInTheDocument()
})

test('deveMostrarFundamentosAlvosFuncionaisELimites', () => {
  renderizar('/fes')

  for (const titulo of ['O que é FES', 'Diferença entre NMES e FES', 'Alvos funcionais', 'Limites que mudam a decisão']) {
    expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument()
  }
  expect(screen.getByText('Dorsiflexão:')).toBeInTheDocument()
  expect(screen.getByText(/não autoriza aumentar a corrente indefinidamente/)).toBeInTheDocument()
})

test('deveExplicarADiferencaEntreOModoFesDoAparelhoEAFesFuncional', () => {
  renderizar('/fes')

  expect(screen.getByRole('table')).toBeInTheDocument()
  expect(screen.getByText(/Pode ser só o nome comercial de um programa muscular/)).toBeInTheDocument()
})

test('deveMostrarOsCincoParametrosMotoresComFaixaEducativaSoOndeHaNumero', () => {
  renderizar('/fes/parametros')

  for (const nome of ['Frequência', 'Duração de fase/pulso', 'Amplitude', 'Trabalho e repouso', 'Rampas']) {
    expect(screen.getByRole('heading', { name: nome })).toBeInTheDocument()
  }
  expect(screen.getAllByText('Faixa educativa')).toHaveLength(2)
  expect(screen.getByText('Cerca de 20–50 Hz')).toBeInTheDocument()
})

test('deveTrazerOExercicioAComAsContasCorretasEClassificadoComoNmes', () => {
  renderizar('/fes/parametros')

  const exercicio = screen.getByRole('region', { name: 'Exercício A: ativação de quadríceps' })
  for (const ajuste of ['35 Hz', '300 µs', 'Subida 2 s', 'Platô 6 s', 'Descida 2 s', 'Repouso 30 s', '8 ciclos']) {
    expect(within(exercicio).getByText(ajuste)).toBeInTheDocument()
  }
  expect(within(exercicio).getByText('Exercício total: 320 s (5 min 20 s).')).toBeInTheDocument()
  expect(within(exercicio).getByText(/^NMES, pois não há tarefa funcional/)).toBeInTheDocument()
})

test('deveTrazerOExercicioBComTarefaExplicita', () => {
  renderizar('/fes/parametros')

  const exercicio = screen.getByRole('region', { name: 'Exercício B: abertura da mão' })
  for (const ajuste of ['30 Hz', '250 µs', 'Subida 1 s', 'Platô 3 s', 'Descida 1 s', 'Repouso 15 s', '6 ciclos']) {
    expect(within(exercicio).getByText(ajuste)).toBeInTheDocument()
  }
  expect(within(exercicio).getByText(/Há tarefa explícita/)).toBeInTheDocument()
})

test('deveMostrarContextoFonteELimitacoesEmTodoExercicio', () => {
  renderizar('/fes/parametros')

  for (const nome of ['Exercício A: ativação de quadríceps', 'Exercício B: abertura da mão']) {
    const exercicio = within(screen.getByRole('region', { name: nome }))
    expect(exercicio.getByText('Contexto')).toBeInTheDocument()
    expect(exercicio.getByText('Fonte')).toBeInTheDocument()
    expect(exercicio.getByText('Limitações')).toBeInTheDocument()
  }
})

test('deveSepararAEspecificacaoDoFabricanteDaFaixaEducativa', () => {
  renderizar('/fes/parametros')

  const fabricante = within(screen.getByRole('region', { name: 'Especificação do fabricante' }))
  expect(fabricante.getByText(/FES Sinc, FES Rec, VIF Sinc e VIF Rec/)).toBeInTheDocument()
  expect(fabricante.getByText(/Não são faixa educativa/)).toBeInTheDocument()
})

test('deveMostrarOAtlasDeFesNaAbaEletrodos', () => {
  renderizar('/fes/eletrodos')

  const regioes = within(screen.getByRole('group', { name: 'Regiões' })).getAllByRole('button')
  expect(regioes.map((b) => b.textContent)).toEqual([
    'Quadríceps',
    'Tibial anterior',
    'Extensores de punho e dedos',
    'Abdômen',
    'Coxa posterior (isquiotibiais)',
  ])
})

test('deveMostrarOCorpoCompactoDeFesNaVisaoGeral', () => {
  renderizar('/fes')

  const secao = screen.getByRole('heading', { name: 'Onde ficam os eletrodos' }).parentElement as HTMLElement
  expect(within(secao).getByRole('link', { name: 'Quadríceps' })).toHaveAttribute('href', '/fes/eletrodos?regiao=quadriceps')
})

test.each(['/fes', '/fes/parametros', '/fes/eletrodos?regiao=quadriceps'])('deveSerAcessivelSemViolacoesEm_%s', async (rota) => {
  renderizar(rota)

  expect(await axe(document.body)).toHaveNoViolations()
})
