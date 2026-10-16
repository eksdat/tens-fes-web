import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import * as apiSimulador from '@/features/simulador/api'
import type { FaixaApi } from '@/features/simulador/api'
import { SimuladorPage } from '@/features/simulador/SimuladorPage'
import { renderComRotas } from '../../renderComRotas'

function faixa(modalidade: string, modo: string, parametro: string, unidade: string, extenso: string, origem: FaixaApi['origem'], minimo: number, maximo: number): FaixaApi {
  return { modalidade, modo, parametro, unidade, unidadeExtenso: extenso, origem, minimo, maximo, fonte: 'teste' }
}

const FAIXAS: Record<string, FaixaApi[]> = {
  TENS: [
    faixa('TENS', 'Convencional', 'Frequência', 'Hz', 'hertz', 'EDUCATIVA', 50, 100),
    faixa('TENS', 'Convencional', 'Largura de pulso', 'µs', 'microssegundos', 'EDUCATIVA', 50, 200),
    faixa('TENS', 'Normal', 'Frequência', 'Hz', 'hertz', 'APARELHO', 0.5, 250),
    faixa('TENS', 'Normal', 'Largura de pulso', 'µs', 'microssegundos', 'APARELHO', 50, 500),
    faixa('TENS', 'Normal', 'Intensidade', 'mA', 'miliampères', 'APARELHO', 0, 100),
    faixa('TENS', 'Convencional', 'Frequência', 'Hz', 'hertz', 'APARELHO', 60, 100),
    faixa('TENS', 'Convencional', 'Largura de pulso', 'µs', 'microssegundos', 'APARELHO', 50, 150),
    faixa('TENS', 'Convencional', 'Intensidade', 'mA', 'miliampères', 'APARELHO', 0, 100),
    faixa('TENS', 'Burst', 'Largura de pulso', 'µs', 'microssegundos', 'APARELHO', 50, 500),
    faixa('TENS', 'Acupuntura', 'Frequência', 'Hz', 'hertz', 'EDUCATIVA', 2, 4),
    faixa('TENS', 'Acupuntura', 'Frequência', 'Hz', 'hertz', 'APARELHO', 1, 10),
    faixa('TENS', 'Acupuntura', 'Largura de pulso', 'µs', 'microssegundos', 'APARELHO', 150, 250),
    faixa('TENS', 'Acupuntura', 'Intensidade', 'mA', 'miliampères', 'APARELHO', 0, 100),
  ],
  FES: [
    faixa('FES', 'FES', 'Frequência', 'Hz', 'hertz', 'APARELHO', 0.5, 250),
    faixa('FES', 'FES', 'Largura de pulso', 'µs', 'microssegundos', 'APARELHO', 50, 500),
    faixa('FES', 'FES', 'Intensidade', 'mA', 'miliampères', 'APARELHO', 0, 100),
    faixa('FES', 'FES', 'Rampa de subida', 's', 'segundos', 'APARELHO', 1, 20),
    faixa('FES', 'FES', 'Platô', 's', 'segundos', 'APARELHO', 1, 60),
    faixa('FES', 'FES', 'Rampa de descida', 's', 'segundos', 'APARELHO', 1, 20),
    faixa('FES', 'FES', 'Repouso (tempo OFF)', 's', 'segundos', 'APARELHO', 1, 60),
  ],
}

beforeEach(() => {
  vi.spyOn(apiSimulador, 'buscarFaixas').mockImplementation(async (modalidade) => FAIXAS[modalidade])
})

function renderizar(rota = '/simulador') {
  return renderComRotas(
    <Route
      path="/simulador"
      element={
        <main>
          <SimuladorPage />
        </main>
      }
    />,
    rota,
  )
}

test('deveMostrarOsAvisosFixos', async () => {
  renderizar()

  expect(await screen.findByText('Exemplos didáticos não geram prescrição para pacientes reais.')).toBeInTheDocument()
  expect(screen.getByText(/Os ajustes aqui não acionam equipamentos nem geram prescrição automática/)).toBeInTheDocument()
})

test('deveMostrarCadaControleComSuaUnidade', async () => {
  renderizar()

  const frequencia = await screen.findByRole('textbox', { name: 'Frequência' })
  expect(frequencia).toHaveAccessibleDescription(/hertz/)
  expect(screen.getByRole('textbox', { name: 'Largura de pulso' })).toHaveAccessibleDescription(/microssegundos/)
  expect(screen.getByRole('textbox', { name: 'Intensidade do canal 1' })).toHaveAccessibleDescription(/miliampères/)
  expect(screen.getByRole('textbox', { name: 'Intensidade do canal 2' })).toBeInTheDocument()
})

test('deveListarSoOsModosQueOAparelhoSimula', async () => {
  renderizar()

  const modo = await screen.findByRole('combobox', { name: 'Modo' })
  const opcoes = within(modo)
    .getAllByRole('option')
    .map((o) => o.textContent)
    .filter((texto) => texto !== 'Selecione')
  expect(opcoes).toEqual(['Convencional', 'Normal', 'Acupuntura'])
})

test('deveComecarComAIntensidadeEmZero', async () => {
  renderizar()

  expect(await screen.findByRole('textbox', { name: 'Intensidade do canal 1' })).toHaveValue('0')
  expect(screen.getByText(/Intensidade em zero nos dois canais/)).toBeInTheDocument()
})

test('deveAtualizarADescricaoACadaAjuste', async () => {
  renderizar()
  const usuario = userEvent.setup()
  const frequencia = await screen.findByRole('textbox', { name: 'Frequência' })

  await usuario.clear(frequencia)
  await usuario.type(frequencia, '90')

  expect(screen.getByTestId('descricao-pulso')).toHaveTextContent('90 pulsos por segundo')
  expect(screen.getByTestId('descricao-pulso')).toHaveAttribute('aria-live', 'polite')
})

test('devePedirConferenciaDaUnidadeETravarNoLimiteDoAparelho', async () => {
  renderizar()
  const usuario = userEvent.setup()
  const largura = await screen.findByRole('textbox', { name: 'Largura de pulso' })

  await usuario.clear(largura)
  await usuario.type(largura, '2000')
  await usuario.tab()

  expect(largura).toHaveValue('150')
  expect(screen.getByText(/Confira a unidade: este campo usa microssegundos/)).toBeInTheDocument()
  expect(screen.getByText(/Valor ajustado para 150 µs, o limite do aparelho/)).toBeInTheDocument()
})

test('deveUsarAsFaixasDoModoEscolhido', async () => {
  renderizar('/simulador?modalidade=TENS&modo=Normal')
  const usuario = userEvent.setup()
  const frequencia = await screen.findByRole('textbox', { name: 'Frequência' })

  await usuario.clear(frequencia)
  await usuario.type(frequencia, '200')

  expect(screen.queryByText(/fora da faixa/)).not.toBeInTheDocument()
  await usuario.selectOptions(screen.getByRole('combobox', { name: 'Modo' }), 'Convencional')
  expect(await screen.findByText(/fora da faixa documentada para o aparelho/)).toBeInTheDocument()
})

test('deveAvisarForaDaFaixaEducativaDentroDoAparelho', async () => {
  renderizar('/simulador?modalidade=TENS&modo=Acupuntura')
  const usuario = userEvent.setup()
  const frequencia = await screen.findByRole('textbox', { name: 'Frequência' })

  await usuario.clear(frequencia)
  await usuario.type(frequencia, '8')

  expect(screen.getByText(/fora da faixa educativa deste modo/)).toBeInTheDocument()
})

test('deveAvisarInformacaoAusente', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await usuario.clear(await screen.findByRole('textbox', { name: 'Frequência' }))

  expect(screen.getByText('Ainda faltam dados para discutir essa escolha com segurança.')).toBeInTheDocument()
})

test('deveZerarAIntensidadeAoTrocarDeModo', async () => {
  renderizar()
  const usuario = userEvent.setup()
  const intensidade = await screen.findByRole('textbox', { name: 'Intensidade do canal 1' })

  await usuario.clear(intensidade)
  await usuario.type(intensidade, '20')
  await usuario.selectOptions(screen.getByRole('combobox', { name: 'Modo' }), 'Normal')

  expect(screen.getByRole('textbox', { name: 'Intensidade do canal 1' })).toHaveValue('0')
})

test('deveMostrarRampasSoNoFes', async () => {
  renderizar()
  const usuario = userEvent.setup()
  await screen.findByRole('textbox', { name: 'Frequência' })
  expect(screen.queryByRole('textbox', { name: 'Rampa de subida' })).not.toBeInTheDocument()

  await usuario.click(screen.getByRole('button', { name: 'FES' }))

  expect(await screen.findByRole('textbox', { name: 'Rampa de subida' })).toHaveValue('2')
  expect(screen.getByRole('textbox', { name: 'Platô' })).toHaveValue('6')
  expect(screen.getByTestId('descricao-pulso')).toHaveTextContent('ciclo de trabalho de 25%')
})

test('deveAbrirNaModalidadeEModoDaUrl', async () => {
  renderizar('/simulador?modalidade=FES&modo=FES')

  expect(await screen.findByRole('textbox', { name: 'Repouso' })).toHaveValue('30')
  expect(screen.getByRole('button', { name: 'FES' })).toHaveAttribute('aria-pressed', 'true')
})

test('deveTrazerUmaTabelaEquivalenteAoGrafico', async () => {
  renderizar()

  const tabela = await screen.findByRole('table', { name: 'Valores do gráfico' })
  expect(within(tabela).getByRole('row', { name: /Período 12,5 ms/ })).toBeInTheDocument()
})

test('devePermitirUsoSoPorTeclado', async () => {
  renderizar()
  const usuario = userEvent.setup()
  await screen.findByRole('textbox', { name: 'Frequência' })

  screen.getByRole('button', { name: 'TENS' }).focus()
  await usuario.tab()
  expect(screen.getByRole('button', { name: 'FES' })).toHaveFocus()
  await usuario.keyboard('{Enter}')
  expect(await screen.findByRole('textbox', { name: 'Rampa de subida' })).toBeInTheDocument()
})

test('deveSerAcessivelSemViolacoes', async () => {
  renderizar()
  await screen.findByRole('textbox', { name: 'Frequência' })

  expect(await axe(document.body)).toHaveNoViolations()
})
