import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { axe } from 'vitest-axe'
import { AtlasEletrodos } from '@/features/atlas/AtlasEletrodos'
import { FIGURAS, LADO_ELETRODO, MONTAGENS, PLACA } from '@/features/atlas/montagens'

function renderizar(
  props: Partial<React.ComponentProps<typeof AtlasEletrodos>> = {},
  rota = '/tens/eletrodos',
) {
  const roteador = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <main>
            <AtlasEletrodos modalidade="TENS" base="/tens/eletrodos" {...props} />
          </main>
        ),
      },
    ],
    { initialEntries: [rota] },
  )
  return render(<RouterProvider router={roteador} />)
}

describe('dados das montagens', () => {
  test('deveTerOitoRegioesComTextoAlternativoCuidadosEFonte', () => {
    expect(MONTAGENS).toHaveLength(8)
    for (const m of MONTAGENS) {
      expect(m.descricao.length).toBeGreaterThan(20)
      expect(m.cuidados.length).toBeGreaterThan(0)
      expect(m.fonte.length).toBeGreaterThan(20)
    }
  })

  test('deveTerLadoECaracteristicasDosEletrodosEmCadaRegiao', () => {
    for (const m of MONTAGENS) {
      expect(['esquerdo', 'direito', 'bilateral', 'central']).toContain(m.lado)
      expect(m.caracteristicasEletrodos.tipo.length).toBeGreaterThan(5)
      expect(m.caracteristicasEletrodos.larguraCm).toBeGreaterThan(0)
      expect(m.caracteristicasEletrodos.alturaCm).toBeGreaterThan(0)
    }
  })

  test('deveUsarLadoBilateralQuandoHaUmParDeCadaLado', () => {
    expect(MONTAGENS.find((m) => m.id === 'lombar')?.lado).toBe('bilateral')
    expect(MONTAGENS.find((m) => m.id === 'joelho')?.lado).toBe('esquerdo')
  })

  test('deveCasarCodigoDoEletrodoComOCanal', () => {
    for (const m of MONTAGENS) {
      const codigos = m.eletrodos.map((e) => e.codigo)
      expect(new Set(codigos).size).toBe(codigos.length)
      for (const e of m.eletrodos) expect(e.codigo[0]).toBe(String(e.canal))
    }
  })

  test('deveManterCadaEletrodoInteiroDentroDoRecorteDaRegiao', () => {
    for (const m of MONTAGENS) {
      for (const e of m.eletrodos) {
        expect(e.x - LADO_ELETRODO / 2).toBeGreaterThanOrEqual(m.recorte.x)
        expect(e.x + LADO_ELETRODO / 2).toBeLessThanOrEqual(m.recorte.x + m.recorte.w)
        expect(e.y - LADO_ELETRODO / 2).toBeGreaterThanOrEqual(m.recorte.y)
        expect(e.y + LADO_ELETRODO / 2).toBeLessThanOrEqual(m.recorte.y + m.recorte.h)
      }
    }
  })

  test('deveManterORecorteDentroDaPlacaEOPontoDentroDaFigura', () => {
    for (const m of MONTAGENS) {
      expect(m.recorte.x + m.recorte.w).toBeLessThanOrEqual(PLACA.largura)
      expect(m.recorte.y + m.recorte.h).toBeLessThanOrEqual(PLACA.altura)
      const f = FIGURAS[m.ponto.figura]
      expect(m.ponto.x).toBeGreaterThan(f.x)
      expect(m.ponto.x).toBeLessThan(f.x + f.w)
      expect(m.ponto.y).toBeGreaterThan(f.y)
      expect(m.ponto.y).toBeLessThan(f.y + f.h)
    }
  })

  test('deveMarcarOsEletrodosDeUmParSemSobreposicao', () => {
    for (const m of MONTAGENS) {
      for (const a of m.eletrodos) {
        for (const b of m.eletrodos) {
          if (a === b) continue
          const separados = Math.abs(a.x - b.x) >= LADO_ELETRODO || Math.abs(a.y - b.y) >= LADO_ELETRODO
          expect(separados).toBe(true)
        }
      }
    }
  })

  test('deveUsarDoisEletrodosPorCanal', () => {
    for (const m of MONTAGENS) {
      for (const canal of [1, 2]) {
        const n = m.eletrodos.filter((e) => e.canal === canal).length
        expect([0, 2]).toContain(n)
      }
    }
  })
})

describe('atlas completo', () => {
  test('deveListarSoAsRegioesDaModalidade', () => {
    renderizar({ modalidade: 'TENS' })

    const lista = screen.getByRole('group', { name: 'Regiões' })
    expect(within(lista).getAllByRole('button').map((b) => b.textContent)).toEqual(['Região lombar', 'Joelho', 'Ombro'])
  })

  test('deveListarAsCincoRegioesDeFes', () => {
    renderizar({ modalidade: 'FES', base: '/fes/eletrodos' }, '/fes/eletrodos')

    const lista = screen.getByRole('group', { name: 'Regiões' })
    expect(within(lista).getAllByRole('button')).toHaveLength(5)
  })

  test('deveComecarSemRegiaoEscolhidaEPedirParaEscolher', () => {
    renderizar()

    expect(screen.getByText(/Escolha uma região/)).toBeInTheDocument()
    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  })

  test('deveMostrarODetalheAoEscolherUmaRegiao', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Região lombar' }))

    expect(screen.getByRole('heading', { name: 'Região lombar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Região lombar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Costas em esquema/)).toBeInTheDocument()
    expect(screen.getByText('Parestesia confortável na área selecionada.')).toBeInTheDocument()
  })

  test('deveMostrarLadoECaracteristicasDosEletrodosNoDetalhe', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Joelho' }))

    expect(screen.getByText('Lado')).toBeInTheDocument()
    expect(screen.getByText('Esquerdo')).toBeInTheDocument()
    expect(screen.getByText('Eletrodos')).toBeInTheDocument()
    expect(screen.getByText(/Borracha condutiva, 5 cm × 5 cm/)).toBeInTheDocument()
  })

  test('deveListarOsQuatroEletrodosDaLombarComCanal', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Região lombar' }))

    const lista = screen.getByRole('list', { name: 'Eletrodos' })
    const codigos = within(lista)
      .getAllByRole('listitem')
      .map((li) => li.textContent?.slice(0, 2))
    expect(codigos).toEqual(['1A', '1B', '2A', '2B'])
  })

  test('deveEscreverOCodigoDeCadaEletrodoNoDesenhoPoisACorEhRedundante', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Região lombar' }))

    const figura = screen.getByRole('figure')
    for (const codigo of ['1A', '1B', '2A', '2B']) {
      expect(within(figura).getByText(codigo)).toBeInTheDocument()
    }
  })

  test('deveMostrarALegendaObrigatoriaEmTodaPrancha', async () => {
    renderizar()
    const usuario = userEvent.setup()

    for (const regiao of ['Região lombar', 'Joelho', 'Ombro']) {
      await usuario.click(screen.getByRole('button', { name: regiao }))
      expect(screen.getByText(/não significam polo positivo ou negativo/)).toBeInTheDocument()
    }
  })

  test('deveTrocarDeModalidadeEFiltrarPelaVista', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'NMES/FES' }))
    expect(within(screen.getByRole('group', { name: 'Regiões' })).getAllByRole('button')).toHaveLength(5)

    await usuario.click(screen.getByRole('button', { name: 'Costas (posterior)' }))
    const nomes = within(screen.getByRole('group', { name: 'Regiões' }))
      .getAllByRole('button')
      .map((b) => b.textContent)
    expect(nomes).toEqual(['Extensores de punho e dedos', 'Coxa posterior (isquiotibiais)'])
  })

  test('deveMostrarTodasAsRegioesNaOpcaoTodosEFiltrarPelaVista', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Todos' }))
    expect(within(screen.getByRole('group', { name: 'Regiões' })).getAllByRole('button')).toHaveLength(8)

    await usuario.click(screen.getByRole('button', { name: 'Costas (posterior)' }))
    const nomes = within(screen.getByRole('group', { name: 'Regiões' }))
      .getAllByRole('button')
      .map((b) => b.textContent)
    expect(nomes).toEqual(['Região lombar', 'Extensores de punho e dedos', 'Ombro', 'Coxa posterior (isquiotibiais)'])
  })

  test('deveManterARegiaoAbertaQuandoAModalidadeVoltaATodos', async () => {
    renderizar({}, '/tens/eletrodos?regiao=joelho')
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Todos' }))

    expect(screen.getByRole('heading', { name: 'Joelho' })).toBeInTheDocument()
  })

  test('deveFecharARegiaoQuandoOFiltroARetira', async () => {
    renderizar({}, '/tens/eletrodos?regiao=lombar')
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Frente (anterior)' }))

    expect(screen.queryByRole('heading', { name: 'Região lombar' })).not.toBeInTheDocument()
  })

  test('deveMostrarOndeFicaECreditarAIlustracao', () => {
    renderizar({}, '/tens/eletrodos?regiao=ombro')

    expect(screen.getByText('Onde fica')).toBeInTheDocument()
    expect(screen.getByText(/CC BY-SA 4.0/)).toBeInTheDocument()
  })

  test('deveAbrirARegiaoIndicadaNaUrl', () => {
    renderizar({}, '/tens/eletrodos?regiao=joelho')

    expect(screen.getByRole('heading', { name: 'Joelho' })).toBeInTheDocument()
  })

  test('deveIgnorarRegiaoInvalidaOuDeOutraModalidade', () => {
    renderizar({}, '/tens/eletrodos?regiao=quadriceps')

    expect(screen.getByText(/Escolha uma região/)).toBeInTheDocument()
  })

  test('deveEscolherPeloPontoNoCorpo', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(document.querySelector('[data-regiao="joelho"]') as HTMLElement)

    expect(screen.getByRole('heading', { name: 'Joelho' })).toBeInTheDocument()
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    renderizar({}, '/tens/eletrodos?regiao=lombar')

    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('atlas compacto', () => {
  test('deveLevarCadaRegiaoParaAbaEletrodosSemMostrarDetalhe', () => {
    renderizar({ compacto: true }, '/tens')

    const lista = screen.getByRole('group', { name: 'Regiões' })
    expect(within(lista).getByRole('link', { name: 'Região lombar' })).toHaveAttribute(
      'href',
      '/tens/eletrodos?regiao=lombar',
    )
    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  })

  test('deveDeixarOsFiltrosForaDoModoCompacto', () => {
    renderizar({ compacto: true }, '/tens')

    expect(screen.queryByRole('group', { name: 'Modalidade' })).not.toBeInTheDocument()
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    renderizar({ compacto: true }, '/tens')

    expect(await axe(document.body)).toHaveNoViolations()
  })
})
