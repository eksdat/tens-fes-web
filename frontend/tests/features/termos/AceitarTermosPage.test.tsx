import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import { renderComRotas } from '../../renderComRotas'
import { AceitarTermosPage } from '@/features/termos/AceitarTermosPage'
import * as api from '@/features/usuario/aceitarTermos'

function renderizar() {
  return renderComRotas(
    <>
      <Route path="/termos/aceitar" element={<AceitarTermosPage />} />
      <Route path="/" element={<p>tela inicial</p>} />
    </>,
    '/termos/aceitar',
  )
}

beforeEach(() => vi.restoreAllMocks())

test('deveExigirOAceiteAntesDeContinuar', async () => {
  const aceitar = vi.spyOn(api, 'aceitarTermos')
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(await screen.findByText('Aceite os termos de uso e a política de privacidade')).toBeInTheDocument()
  expect(aceitar).not.toHaveBeenCalled()
})

test('deveRegistrarOAceiteEIrParaOInicio', async () => {
  const aceitar = vi.spyOn(api, 'aceitarTermos').mockResolvedValue({} as never)
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(screen.getByRole('checkbox', { name: /Li e aceito/ }))
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }))

  await waitFor(() => expect(aceitar).toHaveBeenCalled())
  expect(await screen.findByText('tela inicial')).toBeInTheDocument()
})

test('deveLinkarOsDocumentos', () => {
  renderizar()

  expect(screen.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute('href', '/termos')
  expect(screen.getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute('href', '/privacidade')
})

test('deveSerAcessivelSemViolacoes', async () => {
  renderizar()

  expect(await axe(document.body)).toHaveNoViolations()
})
