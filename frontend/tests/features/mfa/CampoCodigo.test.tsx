import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { CampoCodigo } from '@/features/mfa/CampoCodigo'

function renderizar(erro?: string) {
  const aoMudar = vi.fn()
  const resultado = render(<CampoCodigo onChange={aoMudar} erro={erro} />)
  const caixa = (n: number) => screen.getByLabelText(`Dígito ${n} de 6`)
  return { aoMudar, caixa, ...resultado }
}

test('deveMostrarSeisCaixasNumericasComLegenda', () => {
  const { caixa } = renderizar()

  expect(screen.getByRole('group', { name: 'Código de 6 dígitos' })).toBeInTheDocument()
  for (let n = 1; n <= 6; n++) expect(caixa(n)).toHaveAttribute('inputmode', 'numeric')
  expect(caixa(1)).toHaveAttribute('autocomplete', 'one-time-code')
})

test('deveAvancarParaAProximaCaixaAoDigitar', async () => {
  const { caixa, aoMudar } = renderizar()

  await userEvent.type(caixa(1), '123')

  expect(caixa(1)).toHaveValue('1')
  expect(caixa(3)).toHaveValue('3')
  expect(caixa(4)).toHaveFocus()
  expect(aoMudar).toHaveBeenLastCalledWith('123')
})

test('deveIgnorarLetrasESimbolos', async () => {
  const { caixa, aoMudar } = renderizar()

  await userEvent.type(caixa(1), 'a-1b2')

  expect(aoMudar).toHaveBeenLastCalledWith('12')
})

test('deveDistribuirOsDigitosColados', async () => {
  const { caixa, aoMudar } = renderizar()

  await userEvent.click(caixa(1))
  await userEvent.paste('123 456')

  for (let n = 1; n <= 6; n++) expect(caixa(n)).toHaveValue(String(n))
  expect(aoMudar).toHaveBeenLastCalledWith('123456')
  expect(caixa(6)).toHaveFocus()
})

test('deveAceitarOCodigoInteiroQueOCelularPreencheNaPrimeiraCaixa', async () => {
  const { caixa, aoMudar } = renderizar()

  await userEvent.type(caixa(1), '654321')

  expect(aoMudar).toHaveBeenLastCalledWith('654321')
})

test('deveVoltarEApagarComBackspaceNaCaixaVazia', async () => {
  const { caixa, aoMudar } = renderizar()
  await userEvent.type(caixa(1), '12')

  await userEvent.keyboard('{Backspace}')

  expect(caixa(2)).toHaveFocus()
  expect(aoMudar).toHaveBeenLastCalledWith('1')
  await userEvent.keyboard('{Backspace}')
  expect(caixa(1)).toHaveFocus()
  expect(aoMudar).toHaveBeenLastCalledWith('')
})

test('deveNavegarComAsSetas', async () => {
  const { caixa } = renderizar()
  await userEvent.click(caixa(3))

  await userEvent.keyboard('{ArrowLeft}')
  expect(caixa(2)).toHaveFocus()
  await userEvent.keyboard('{ArrowRight}{ArrowRight}')
  expect(caixa(4)).toHaveFocus()
})

test('deveMostrarOErroLigadoAoGrupo', () => {
  renderizar('Digite os 6 números do aplicativo')

  expect(screen.getByRole('group', { name: 'Código de 6 dígitos' })).toHaveAccessibleDescription(
    /Digite os 6 números do aplicativo/,
  )
})

test('deveSerAcessivel', async () => {
  const { container } = renderizar('Digite os 6 números do aplicativo')

  expect(await axe(container)).toHaveNoViolations()
})
