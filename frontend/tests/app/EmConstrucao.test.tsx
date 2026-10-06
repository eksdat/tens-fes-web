import { render, screen } from '@testing-library/react'
import { EmConstrucao } from '@/app/EmConstrucao'

test('deveTitularATelaEAvisarQueEstaEmConstrucao', () => {
  render(<EmConstrucao titulo="TENS" />)

  expect(screen.getByRole('heading', { level: 1, name: 'TENS' })).toBeInTheDocument()
  expect(screen.getByText('Esta tela está em construção.')).toBeInTheDocument()
})
