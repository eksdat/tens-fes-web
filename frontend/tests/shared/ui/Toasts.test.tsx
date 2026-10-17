import { act, fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { RegiaoToasts, ToastsProvider } from '@/shared/ui/Toasts'
import { useToast, type NovoToast } from '@/shared/ui/useToast'

function Disparar({ toast, rotulo = 'Disparar' }: { toast: NovoToast; rotulo?: string }) {
  const { mostrar } = useToast()
  return (
    <button type="button" onClick={() => mostrar(toast)}>
      {rotulo}
    </button>
  )
}

function renderizar(...toasts: NovoToast[]) {
  return render(
    <ToastsProvider>
      <RegiaoToasts />
      {toasts.map((toast, i) => (
        <Disparar key={i} toast={toast} rotulo={`Disparar ${i + 1}`} />
      ))}
    </ToastsProvider>,
  )
}

function disparar(n = 1) {
  fireEvent.click(screen.getByRole('button', { name: `Disparar ${n}` }))
}

afterEach(() => {
  vi.useRealTimers()
})

test('deveTerAsRegioesNaPaginaAntesDeQualquerAviso', () => {
  renderizar()

  expect(screen.getByRole('status')).toBeEmptyDOMElement()
  expect(screen.getByRole('alert')).toBeEmptyDOMElement()
})

test('deveAnunciarSucessoNaRegiaoEducadaEErroNaAssertiva', () => {
  renderizar({ tipo: 'sucesso', titulo: 'Paciente cadastrado' }, { tipo: 'erro', titulo: 'Não foi possível salvar' })

  disparar(1)
  disparar(2)

  expect(screen.getByRole('status')).toHaveTextContent('Paciente cadastrado')
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar')
})

test('deveSumirSozinhoDepoisDeOitoSegundosQuandoESucesso', () => {
  vi.useFakeTimers()
  renderizar({ tipo: 'sucesso', titulo: 'Avaliação salva' })

  disparar()
  act(() => vi.advanceTimersByTime(7_900))
  expect(screen.getByText('Avaliação salva')).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(200))
  expect(screen.queryByText('Avaliação salva')).not.toBeInTheDocument()
})

test('devePausarOTempoEnquantoOMouseEstaSobreOAviso', () => {
  vi.useFakeTimers()
  renderizar({ tipo: 'info', titulo: 'Enviado para revisão' })

  disparar()
  act(() => vi.advanceTimersByTime(5_000))
  fireEvent.mouseEnter(screen.getByText('Enviado para revisão').closest('.tf-toast') as HTMLElement)
  act(() => vi.advanceTimersByTime(20_000))
  expect(screen.getByText('Enviado para revisão')).toBeInTheDocument()

  fireEvent.mouseLeave(screen.getByText('Enviado para revisão').closest('.tf-toast') as HTMLElement)
  act(() => vi.advanceTimersByTime(3_100))
  expect(screen.queryByText('Enviado para revisão')).not.toBeInTheDocument()
})

test('deveManterErroEAtencaoAteSeremFechados', () => {
  vi.useFakeTimers()
  renderizar({ tipo: 'erro', titulo: 'Não foi possível salvar' }, { tipo: 'atencao', titulo: 'Conteúdo sem fonte' })

  disparar(1)
  disparar(2)
  act(() => vi.advanceTimersByTime(60_000))

  expect(screen.getByText('Não foi possível salvar')).toBeInTheDocument()
  expect(screen.getByText('Conteúdo sem fonte')).toBeInTheDocument()
})

test('deveFecharPeloBotaoComNomeQueDizQualAviso', () => {
  renderizar({ tipo: 'erro', titulo: 'Não foi possível salvar' })

  disparar()
  fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso: Não foi possível salvar' }))

  expect(screen.queryByText('Não foi possível salvar')).not.toBeInTheDocument()
})

test('deveExecutarAAcaoEFecharOAviso', () => {
  const aoClicar = vi.fn()
  renderizar({ tipo: 'sucesso', titulo: 'Sessão registrada', acao: { rotulo: 'Desfazer', aoClicar } })

  disparar()
  fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }))

  expect(aoClicar).toHaveBeenCalledOnce()
  expect(screen.queryByText('Sessão registrada')).not.toBeInTheDocument()
})

test('deveMostrarNoMaximoTresEColocarOExcedenteEmFila', () => {
  renderizar(
    { tipo: 'atencao', titulo: 'Primeiro' },
    { tipo: 'atencao', titulo: 'Segundo' },
    { tipo: 'atencao', titulo: 'Terceiro' },
    { tipo: 'atencao', titulo: 'Quarto' },
  )

  disparar(1)
  disparar(2)
  disparar(3)
  disparar(4)
  expect(screen.queryByText('Quarto')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso: Primeiro' }))
  expect(screen.getByText('Quarto')).toBeInTheDocument()
})

test('deveMostrarOMaisNovoNoTopo', () => {
  renderizar({ tipo: 'atencao', titulo: 'Antigo' }, { tipo: 'atencao', titulo: 'Novo' })

  disparar(1)
  disparar(2)

  const titulos = screen.getAllByText(/Antigo|Novo/).map((el) => el.textContent)
  expect(titulos).toEqual(['Novo', 'Antigo'])
})

test('deveRenderizarSemViolacoesDeAcessibilidade', async () => {
  renderizar({ tipo: 'sucesso', titulo: 'Paciente cadastrado', texto: 'Os dados foram salvos.' }, { tipo: 'erro', titulo: 'Erro' })

  disparar(1)
  disparar(2)

  expect(await axe(document.body)).toHaveNoViolations()
})
