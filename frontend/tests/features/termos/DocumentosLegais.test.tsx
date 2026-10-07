import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { PoliticaPrivacidadePage } from '@/features/termos/PoliticaPrivacidadePage'
import { TermosDeUsoPage } from '@/features/termos/TermosDeUsoPage'

test.each([
  ['Termos de uso', TermosDeUsoPage, '/privacidade'],
  ['Política de privacidade', PoliticaPrivacidadePage, '/termos'],
])('deveMostrar%sComVoltaAoCadastroEAcessivel', async (titulo, Pagina, linkOutro) => {
  const { container } = render(
    <MemoryRouter>
      <Pagina />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Voltar ao cadastro' })).toHaveAttribute('href', '/cadastro')
  expect(container.querySelector(`a[href="${linkOutro}"]`)).not.toBeNull()
  expect(await axe(container)).toHaveNoViolations()
})
