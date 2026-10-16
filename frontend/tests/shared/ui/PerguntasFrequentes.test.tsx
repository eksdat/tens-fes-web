import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { PerguntasFrequentes, type ItemFaq } from '@/shared/ui/PerguntasFrequentes'

const ITENS: ItemFaq[] = [
  { pergunta: 'Primeira?', destaque: 'Resposta curta um.', detalhe: 'Detalhe um.', acao: { rotulo: 'Ver módulo', para: '/fes' } },
  { pergunta: 'Segunda?', destaque: 'Resposta curta dois.' },
  {
    pergunta: 'Terceira?',
    destaque: 'Resposta curta três.',
    alerta: { titulo: 'Interrompa a estimulação', texto: 'Verifique pele, eletrodo e contato.' },
  },
]

function renderizar() {
  return render(
    <MemoryRouter>
      <PerguntasFrequentes itens={ITENS} fonteHref="#fonte-revisao" />
    </MemoryRouter>,
  )
}

test('deveAbrirSoAPrimeiraPerguntaPorPadrao', () => {
  renderizar()

  expect(screen.getByRole('button', { name: 'Primeira?' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('button', { name: 'Segunda?' })).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByRole('button', { name: 'Terceira?' })).toHaveAttribute('aria-expanded', 'false')
})

test('deveAbrirEFecharAoClicarMantendoAsOutrasAbertas', async () => {
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(screen.getByRole('button', { name: 'Segunda?' }))
  expect(screen.getByRole('button', { name: 'Segunda?' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('button', { name: 'Primeira?' })).toHaveAttribute('aria-expanded', 'true')

  await usuario.click(screen.getByRole('button', { name: 'Primeira?' }))
  expect(screen.getByRole('button', { name: 'Primeira?' })).toHaveAttribute('aria-expanded', 'false')
})

test('deveLigarCadaPerguntaASuaRespostaPorRegiao', () => {
  renderizar()

  const botao = screen.getByRole('button', { name: 'Primeira?' })
  const regiao = screen.getByRole('region', { name: 'Primeira?' })
  expect(botao).toHaveAttribute('aria-controls', regiao.id)
})

test('deveMostrarDestaqueDetalheAcaoEFonte', () => {
  renderizar()

  expect(screen.getByText('Resposta curta um.')).toBeInTheDocument()
  expect(screen.getByText('Detalhe um.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Ver módulo/ })).toHaveAttribute('href', '/fes')
  expect(screen.getAllByRole('link', { name: 'Fonte e data de revisão' })[0]).toHaveAttribute('href', '#fonte-revisao')
})

test('deveMostrarAlertaDeSegurancaComAcaoPrimeiro', () => {
  renderizar()

  expect(screen.getByText('Interrompa a estimulação')).toBeInTheDocument()
  expect(screen.getByRole('note')).toBeInTheDocument()
})

test('devePercorrerAsPerguntasComSetasHomeEEnd', async () => {
  renderizar()
  const usuario = userEvent.setup()

  screen.getByRole('button', { name: 'Primeira?' }).focus()
  await usuario.keyboard('{ArrowDown}')
  expect(screen.getByRole('button', { name: 'Segunda?' })).toHaveFocus()

  await usuario.keyboard('{End}')
  expect(screen.getByRole('button', { name: 'Terceira?' })).toHaveFocus()

  await usuario.keyboard('{ArrowDown}')
  expect(screen.getByRole('button', { name: 'Primeira?' })).toHaveFocus()

  await usuario.keyboard('{ArrowUp}')
  expect(screen.getByRole('button', { name: 'Terceira?' })).toHaveFocus()

  await usuario.keyboard('{Home}')
  expect(screen.getByRole('button', { name: 'Primeira?' })).toHaveFocus()
})

test('deveAlternarComEnterEEspaco', async () => {
  renderizar()
  const usuario = userEvent.setup()

  screen.getByRole('button', { name: 'Segunda?' }).focus()
  await usuario.keyboard('{Enter}')
  expect(screen.getByRole('button', { name: 'Segunda?' })).toHaveAttribute('aria-expanded', 'true')

  await usuario.keyboard(' ')
  expect(screen.getByRole('button', { name: 'Segunda?' })).toHaveAttribute('aria-expanded', 'false')
})

test('deveSerAcessivelSemViolacoes', async () => {
  const { container } = renderizar()

  expect(await axe(container)).toHaveNoViolations()
})
