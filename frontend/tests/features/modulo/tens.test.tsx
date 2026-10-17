import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { axe } from 'vitest-axe'
import { rotasDoModulo } from '@/features/modulo/rotasDoModulo'
import { TENS } from '@/features/tens/conteudoTens'

vi.mock('@/features/modulo/usePaginaTecnica', () => import('./paginaTecnicaFalsa'))

function renderizar(rota: string) {
  const roteador = createMemoryRouter([{ element: <main><Outlet /></main>, children: [rotasDoModulo(TENS)] }], { initialEntries: [rota] })
  return render(<RouterProvider router={roteador} />)
}

const ABAS = ['Visão geral', 'Aparelho', 'Eletrodos', 'Parâmetros', 'Segurança', 'Casos']

test('deveMostrarAsSeisAbasNaOrdemDoGuia', () => {
  renderizar('/tens')

  const abas = within(screen.getByRole('navigation', { name: 'Seções de TENS' })).getAllByRole('link')
  expect(abas.map((a) => a.textContent)).toEqual(ABAS)
})

test('deveMarcarSoAAbaAtual', () => {
  renderizar('/tens/parametros')

  expect(screen.getByRole('link', { name: 'Parâmetros' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current')
})

test('deveAbrirNaVisaoGeralNaRotaDoModulo', () => {
  renderizar('/tens')

  expect(screen.getByRole('heading', { level: 1, name: 'Alívio da dor' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: 'Visão geral' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute('aria-current', 'page')
})

test('deveExplicarFundamentosMecanismoBeneficioEPerguntas', () => {
  renderizar('/tens')

  expect(screen.getByText(/estimulação elétrica nervosa transcutânea/i)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Como o TENS age na dor' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'O que a evidência mostra' })).toBeInTheDocument()
  expect(screen.getByText('Qual intensidade em mA?')).toBeInTheDocument()
})

test('deveMostrarOCorpoCompactoNaVisaoGeralComLinkParaOAtlas', () => {
  renderizar('/tens')

  const secao = screen.getByRole('heading', { name: 'Onde ficam os eletrodos' }).parentElement as HTMLElement
  expect(within(secao).getByRole('link', { name: 'Região lombar' })).toHaveAttribute('href', '/tens/eletrodos?regiao=lombar')
})

test('deveMostrarComoColocarERecomendacoesNaAbaEletrodos', () => {
  renderizar('/tens/eletrodos')

  expect(screen.getByRole('heading', { level: 2, name: 'Eletrodos' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Como colocar' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Recomendações' })).toBeInTheDocument()
  expect(screen.getByText(/Troque eletrodos de borracha/)).toBeInTheDocument()
})

test('deveSepararAEspecificacaoDoFabricanteDaFaixaEducativa', () => {
  renderizar('/tens/eletrodos')

  const cartao = screen.getByRole('heading', { name: 'Especificação do fabricante' }).parentElement as HTMLElement
  expect(within(cartao).getByText(/50 mA pico a pico/)).toBeInTheDocument()
  expect(within(cartao).getByText(/não é faixa educativa/)).toBeInTheDocument()
})

test('deveListarOsVideosDeApoioComoLinksExternos', () => {
  renderizar('/tens')

  const link = screen.getByRole('link', { name: /TENS na dor crônica/ })
  expect(link).toHaveAttribute('href', 'https://www.youtube.com/shorts/ykbbICnwbXo')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  expect(screen.getByText(/ainda sem revisão docente/)).toBeInTheDocument()
})

test('deveExplicarComoIdentificarOsEletrodos', () => {
  renderizar('/tens/eletrodos')

  expect(screen.getByRole('heading', { name: 'Como identificar cada eletrodo' })).toBeInTheDocument()
  expect(screen.getByText(/A letra não é polo positivo nem negativo/)).toBeInTheDocument()
  expect(screen.getByText(/Não há ordem entre A e B/)).toBeInTheDocument()
})

test('deveTrazerOVideoDeDisposicaoDosEletrodosNaAbaEletrodos', () => {
  renderizar('/tens/eletrodos')

  expect(screen.getByRole('link', { name: /disposição correta dos eletrodos/ })).toHaveAttribute(
    'href',
    'https://www.youtube.com/watch?v=mwZ6HpjzBqw',
  )
})

test('deveMostrarFonteERevisaoDaPaginaTecnica', () => {
  renderizar('/tens')

  const rodape = screen.getByRole('contentinfo')
  expect(within(rodape).getAllByText(/johnson/i)).toHaveLength(2)
  expect(within(rodape).getByText('Guia técnico TENS + FES, seção 07')).toBeInTheDocument()
  expect(within(rodape).getByText('Revisão docente: 10/10/2026.')).toBeInTheDocument()
})

test('deveListarOsQuatroModosComFaixaEducativa', () => {
  renderizar('/tens/parametros')

  for (const modo of ['Convencional', 'Tipo acupuntura', 'Burst / rajadas', 'Modulado']) {
    expect(screen.getByRole('heading', { name: modo })).toBeInTheDocument()
  }
  expect(screen.getByText('50–100 Hz; 50–200 µs')).toBeInTheDocument()
  expect(screen.getAllByText('Faixa educativa')).toHaveLength(3)
})

test('deveMarcarCadaFaixaNumericaComoFaixaEducativaENuncaComoPrescricao', () => {
  renderizar('/tens/parametros')

  const faixas = screen.getAllByText('Faixa educativa')
  for (const rotulo of faixas) {
    expect(rotulo.closest('dl')?.textContent).toMatch(/Hz|µs|rajadas/)
  }
  expect(screen.getByText('Faixa educativa, não é prescrição')).toBeInTheDocument()
})

test('deveMostrarContextoFonteELimitacoesNoExemplo', () => {
  renderizar('/tens/parametros')

  const exemplo = screen.getByRole('region', { name: 'Exemplo educativo' })
  expect(within(exemplo).getByText('Contexto')).toBeInTheDocument()
  expect(within(exemplo).getByText('Fonte')).toBeInTheDocument()
  expect(within(exemplo).getByText('Limitações')).toBeInTheDocument()
  expect(within(exemplo).getByText(/não é regra clínica/)).toBeInTheDocument()
})

test('deveNaoSugerirValorDeIntensidadeForaDaEspecificacaoDoFabricante', () => {
  const { container } = renderizar('/tens/parametros')

  container.querySelector('[aria-labelledby="especificacao-fabricante"]')?.remove()

  expect(container.textContent).not.toMatch(/\d\s*mA/)
})

test('deveMostrarAFaixaDoFabricanteSeparadaDaFaixaEducativa', () => {
  renderizar('/tens/parametros')

  const fabricante = within(screen.getByRole('region', { name: 'Especificação do fabricante' }))
  expect(fabricante.getByText(/TENS Convencional: 60–100 Hz; fase de 50–150 µs/)).toBeInTheDocument()
  expect(fabricante.getByText(/Não são faixa educativa/)).toBeInTheDocument()
})

test.each(['/tens', '/tens/parametros', '/tens/eletrodos?regiao=lombar', '/tens/casos'])('deveSerAcessivelSemViolacoesEm_%s', async (rota) => {
  renderizar(rota)

  expect(await axe(document.body)).toHaveNoViolations()
})
