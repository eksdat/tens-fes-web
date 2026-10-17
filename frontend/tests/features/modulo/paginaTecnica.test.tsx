import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { CorpoMarkdown } from '@/features/modulo/CorpoMarkdown'
import { rotasDoModulo } from '@/features/modulo/rotasDoModulo'
import type { PaginaTecnicaApi } from '@/features/modulo/usePaginaTecnica'
import { TENS } from '@/features/tens/conteudoTens'

const { resposta } = vi.hoisted(() => ({ resposta: { atual: {} as object } }))
vi.mock('@/features/modulo/usePaginaTecnica', () => ({ usePaginaTecnica: () => resposta.atual }))

function pagina(parcial: Partial<PaginaTecnicaApi>): PaginaTecnicaApi {
  return { modalidade: 'TENS', secao: 'VISAO_GERAL', liberada: true, blocos: [], referencias: [], dataRevisao: null, ...parcial }
}

function renderizarVisaoGeral(estado: object) {
  resposta.atual = estado
  const roteador = createMemoryRouter([{ element: <main><Outlet /></main>, children: [rotasDoModulo(TENS)] }], {
    initialEntries: ['/tens'],
  })
  return render(<RouterProvider router={roteador} />)
}

describe('CorpoMarkdown', () => {
  test('deveDescartarHtmlCruSemExecutarScript', () => {
    const { container } = render(
      <CorpoMarkdown texto={'Texto <script>window.invadido = true</script> e <img src="x" onerror="window.invadido = true">'} />,
    )

    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
    expect((window as { invadido?: boolean }).invadido).toBeUndefined()
  })

  test('deveTirarOLinkDeEnderecoJavascript', () => {
    render(<CorpoMarkdown texto="[clique](javascript:alert(1))" />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('clique')).toBeInTheDocument()
  })

  test('deveManterLinkHttpsAbrindoEmOutraAba', () => {
    render(<CorpoMarkdown texto="[fonte](https://pmc.ncbi.nlm.nih.gov/articles/PMC4589923/)" />)

    const link = screen.getByRole('link', { name: /fonte/ })
    expect(link).toHaveAttribute('href', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4589923/')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  test('deveRebaixarOsTitulosDoCorpoParaH3EH4', () => {
    render(<CorpoMarkdown texto={'# Primeiro\n\n## Segundo'} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Primeiro' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Segundo' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})

describe('Visão geral como página padrão', () => {
  const liberada = pagina({
    blocos: [
      { bloco: 'O_QUE_E', titulo: 'O que é TENS', corpo: '# Definição\n\nTexto.', referencias: '[R1]' },
      { bloco: 'CUIDADOS', titulo: 'Cuidados', corpo: 'Cuide.', referencias: '[R4]' },
    ],
    referencias: ['[R1]', 'Guia técnico, seção 07'],
    dataRevisao: '2026-10-05',
  })

  test('deveMostrarOsBlocosNaOrdemDaApi', () => {
    renderizarVisaoGeral({ isPending: false, isError: false, data: liberada })

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos.indexOf('O que é TENS')).toBeLessThan(titulos.indexOf('Cuidados'))
  })

  test('deveManterAHierarquiaDeTitulosSemPularNivel', () => {
    const { container } = renderizarVisaoGeral({ isPending: false, isError: false, data: liberada })

    const niveis = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]))
    expect(niveis[0]).toBe(1)
    for (let i = 1; i < niveis.length; i++) expect(niveis[i] - niveis[i - 1]).toBeLessThanOrEqual(1)
  })

  test('deveTerminarComFonteEDataDeRevisao', () => {
    const { container } = renderizarVisaoGeral({ isPending: false, isError: false, data: liberada })

    const artigo = container.querySelector('article') as HTMLElement
    expect(artigo.lastElementChild).toBe(screen.getByRole('contentinfo'))
    expect(within(screen.getByRole('contentinfo')).getByText('Revisão docente: 05/10/2026.')).toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByText('Guia técnico, seção 07')).toBeInTheDocument()
  })

  test('deveMostrarOAvisoQuandoAPaginaNaoFoiLiberada', () => {
    renderizarVisaoGeral({ isPending: false, isError: false, data: pagina({ liberada: false }) })

    expect(screen.getByText('Conteúdo ainda não liberado')).toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByText('Revisão docente: pendente.')).toBeInTheDocument()
  })

  test('deveAvisarQuandoAApiFalha', () => {
    renderizarVisaoGeral({ isPending: false, isError: true, data: undefined })

    expect(screen.getByText('Não foi possível carregar o conteúdo')).toBeInTheDocument()
  })
})
