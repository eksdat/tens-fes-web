import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { BibliotecaPage } from '@/features/biblioteca/BibliotecaPage'

test('deveFiltrarPorModalidadeEAcessoESoEncaminharAConsultaDoLivroRestrito', async () => {
  render(<MemoryRouter><BibliotecaPage /></MemoryRouter>)
  const usuario = userEvent.setup()
  expect(screen.getAllByRole('article')).toHaveLength(8)
  await usuario.selectOptions(screen.getByLabelText('Modalidade'), 'NMES/FES')
  expect(screen.queryByRole('heading', { name: 'Fundamentos de TENS' })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Estimulação neuromuscular' })).toBeInTheDocument()
  await usuario.selectOptions(screen.getByLabelText('Acesso'), 'Institucional ou aquisição')
  const livro = screen.getByRole('article')
  expect(livro).toHaveTextContent(/consulta institucional ou aquisição/i)
  const fonte = within(livro).getByRole('link', { name: /Abrir fonte/ })
  expect(fonte).toHaveAttribute('href', expect.stringContaining('shop.elsevier.com'))
  expect(screen.getByRole('status')).toHaveTextContent('1 referência')
  expect(fonte).not.toHaveAttribute('download')
})
