import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { axe } from 'vitest-axe'
import { FES } from '@/features/fes/conteudoFes'
import { rotasDoModulo } from '@/features/modulo/rotasDoModulo'
import { TENS } from '@/features/tens/conteudoTens'

function renderizar(modulo: typeof TENS, rota: string) {
  const roteador = createMemoryRouter([{ element: <main><Outlet /></main>, children: [rotasDoModulo(modulo)] }], {
    initialEntries: [rota],
  })
  return render(<RouterProvider router={roteador} />)
}

describe.each([
  ['TENS', TENS, '/tens'],
  ['FES', FES, '/fes'],
])('aba Aparelho de %s', (_nome, modulo, base) => {
  test('deveListarOsQuatorzeControlesDoManualNaOrdem', () => {
    renderizar(modulo, `${base}/aparelho`)

    const controles = within(screen.getByRole('list', { name: 'Controles do aparelho' })).getAllByRole('listitem')
    expect(controles).toHaveLength(14)
    expect(controles[0]).toHaveTextContent('Tecla LIGA/DESLIGA')
    expect(controles[5]).toHaveTextContent('Tecla START/STOP')
    expect(controles[11]).toHaveTextContent('Conector do cabo do canal 1')
    expect(controles[12]).toHaveTextContent('Conector do cabo do canal 2')
  })

  test('deveExplicarQueLigarNaoIniciaAEstimulacao', () => {
    renderizar(modulo, `${base}/aparelho`)

    expect(screen.getByText(/Ligar o aparelho não inicia a estimulação/)).toBeInTheDocument()
  })

  test('deveTerPerguntasFrequentesComAPrimeiraAberta', () => {
    renderizar(modulo, `${base}/aparelho`)

    expect(screen.getByRole('heading', { name: 'Perguntas frequentes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ligar o aparelho começa a estimulação?' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'O que é um canal?' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('deveLevarOLinkDaPerguntaParaAAbaEletrodosDoMesmoModulo', () => {
    renderizar(modulo, `${base}/aparelho`)

    expect(screen.getAllByRole('link', { name: /Ver como identificar os eletrodos/ })[0]).toHaveAttribute('href', `${base}/eletrodos`)
  })

  test('deveCitarOManualComoFonte', () => {
    renderizar(modulo, `${base}/aparelho`)

    expect(within(screen.getByRole('contentinfo')).getByText(/Neurodyn Portable/)).toBeInTheDocument()
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    renderizar(modulo, `${base}/aparelho`)

    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe.each([
  ['TENS', TENS, '/tens'],
  ['FES', FES, '/fes'],
])('aba Segurança de %s', (_nome, modulo, base) => {
  test('deveListarAsOitoSituacoesDeTriagem', () => {
    renderizar(modulo, `${base}/seguranca`)

    const secao = screen.getByRole('heading', { name: 'Antes da aplicação' }).parentElement as HTMLElement
    expect(within(secao).getAllByRole('heading', { level: 4 })).toHaveLength(8)
    expect(within(secao).getByRole('heading', { name: 'Dispositivo eletrônico implantado' })).toBeInTheDocument()
    expect(within(secao).getByRole('heading', { name: 'Gestação' })).toBeInTheDocument()
  })

  test('deveTrazerOChecklistDeSeisPerguntas', () => {
    renderizar(modulo, `${base}/seguranca`)

    const secao = screen.getByRole('heading', { name: 'Checklist antes de começar' }).parentElement as HTMLElement
    expect(within(secao).getAllByRole('listitem')).toHaveLength(6)
    expect(within(secao).getByText('Intensidade em zero antes da conexão?')).toBeInTheDocument()
  })

  test('deveTrazerOsCincoGatilhosComAMensagem', () => {
    renderizar(modulo, `${base}/seguranca`)

    expect(screen.getByText('Ardência ou queimação')).toBeInTheDocument()
    expect(screen.getByText('Interrompa a estimulação e verifique pele, eletrodo e contato.')).toBeInTheDocument()
    expect(screen.getByText(/Não aumente automaticamente a amplitude/)).toBeInTheDocument()
  })

  test('deveDizerOQueFicaForaDoEscopo', () => {
    renderizar(modulo, `${base}/seguranca`)

    expect(screen.getByText('Aplicações obstétricas')).toBeInTheDocument()
    expect(screen.getByText(/Não extrapole parâmetros de superfície/)).toBeInTheDocument()
  })

  test('deveSerAcessivelSemViolacoes', async () => {
    renderizar(modulo, `${base}/seguranca`)

    expect(await axe(document.body)).toHaveNoViolations()
  })
})

test('deveOferecerOVideoDeDisposicaoDosEletrodosTambemNoFes', () => {
  renderizar(FES, '/fes/eletrodos')

  expect(screen.getByRole('link', { name: /disposição correta dos eletrodos/ })).toHaveAttribute(
    'href',
    'https://www.youtube.com/watch?v=mwZ6HpjzBqw',
  )
})

test('deveManterOVideoSobreTensSoNoTens', () => {
  renderizar(FES, '/fes')

  expect(screen.queryByRole('link', { name: /TENS na dor crônica/ })).not.toBeInTheDocument()
})

describe('painel interativo do aparelho', () => {
  test('deveDescreverOControleEscolhidoNaLista', async () => {
    renderizar(TENS, '/tens/aparelho')
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: /Tecla START\/STOP/ }))

    expect(screen.getByRole('button', { name: /Tecla START\/STOP/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Controle 6: Tecla START\/STOP\. Inicia ou interrompe o tratamento\./)).toBeInTheDocument()
  })

  test('deveEscolherPeloDesenhoEMarcarAMesmaOpcaoDaLista', async () => {
    renderizar(TENS, '/tens/aparelho')
    const usuario = userEvent.setup()

    await usuario.click(document.querySelector('[data-controle="3"]') as HTMLElement)

    expect(screen.getByRole('button', { name: /Display de parâmetros/ })).toHaveAttribute('aria-pressed', 'true')
  })

  test('deveDesmarcarAoClicarDeNovo', async () => {
    renderizar(TENS, '/tens/aparelho')
    const usuario = userEvent.setup()
    const controle = screen.getByRole('button', { name: /Tecla LIGA\/DESLIGA/ })

    await usuario.click(controle)
    await usuario.click(controle)

    expect(controle).toHaveAttribute('aria-pressed', 'false')
  })

  test('deveAvisarQueOsControlesDeNoveACatorzeFicamEmOutrasFaces', () => {
    renderizar(TENS, '/tens/aparelho')

    expect(screen.getByText(/controles 9 a 14 ficam em outras faces/)).toBeInTheDocument()
  })
})
