import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, RouterProvider, createMemoryRouter } from 'react-router'
import { RaizApp } from './RaizApp'

function renderizar(rotaInicial = '/') {
  const router = createMemoryRouter(
    [
      {
        element: <RaizApp />,
        children: [
          {
            path: '/',
            handle: { titulo: 'Início' },
            element: (
              <main id="conteudo" tabIndex={-1}>
                <Link to="/entrar">Ir para entrar</Link>
              </main>
            ),
          },
          { path: '/entrar', handle: { titulo: 'Entrar' }, element: <main id="conteudo" tabIndex={-1} /> },
          { path: '/sem-titulo', element: <main id="conteudo" tabIndex={-1} /> },
        ],
      },
    ],
    { initialEntries: [rotaInicial] },
  )
  return render(<RouterProvider router={router} />)
}

test('deveTitularAAbaDoNavegadorComAPagina', () => {
  renderizar()

  expect(document.title).toBe('Início · Fisiotech')
})

test('deveTrocarOTituloAoNavegar', async () => {
  renderizar()

  await userEvent.click(screen.getByRole('link', { name: 'Ir para entrar' }))

  expect(document.title).toBe('Entrar · Fisiotech')
})

test('deveAnunciarOTituloParaLeitorDeTela', async () => {
  renderizar()
  expect(screen.getByRole('status')).toHaveTextContent('Início · Fisiotech')

  await userEvent.click(screen.getByRole('link', { name: 'Ir para entrar' }))

  expect(screen.getByRole('status')).toHaveTextContent('Entrar · Fisiotech')
})

test('deveUsarSoONomeDoAppQuandoARotaNaoTemTitulo', () => {
  renderizar('/sem-titulo')

  expect(document.title).toBe('Fisiotech')
})

test('deveTerOLinkPularComoPrimeiroItemDoFoco', async () => {
  renderizar()

  await userEvent.tab()

  expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus()
})

test('devePularParaOConteudoSemMudarAUrl', async () => {
  renderizar()

  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(document.getElementById('conteudo')).toHaveFocus()
  expect(window.location.hash).toBe('')
})
