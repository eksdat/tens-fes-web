import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { BotaoAcessibilidade } from '@/shared/acessibilidade/BotaoAcessibilidade'

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-contraste')
  document.documentElement.removeAttribute('data-movimento')
})

async function abrir() {
  const usuario = userEvent.setup()
  render(<BotaoAcessibilidade />)
  await usuario.click(screen.getByRole('button', { name: 'Acessibilidade' }))
  return usuario
}

test('deveAbrirPainelComAsTresOpcoes', async () => {
  await abrir()

  expect(screen.getByRole('dialog', { name: 'Acessibilidade' })).toBeInTheDocument()
  expect(screen.getByRole('radiogroup', { name: 'Tamanho do texto' })).toBeInTheDocument()
  expect(screen.getByRole('switch', { name: 'Alto contraste' })).toBeInTheDocument()
  expect(screen.getByRole('switch', { name: 'Reduzir movimento' })).toBeInTheDocument()
})

test('deveAumentarOTextoEGuardarAEscolha', async () => {
  const usuario = await abrir()

  await usuario.click(screen.getByRole('radio', { name: 'Grande' }))

  expect(document.documentElement.style.fontSize).toBe('125%')
  expect(JSON.parse(localStorage.getItem('fisiotech.acessibilidade')!).tamanho).toBe('grande')
})

test('deveLigarEDesligarAltoContraste', async () => {
  const usuario = await abrir()
  const chave = screen.getByRole('switch', { name: 'Alto contraste' })

  await usuario.click(chave)
  expect(chave).toBeChecked()
  expect(document.documentElement.dataset.contraste).toBe('alto')

  await usuario.click(chave)
  expect(document.documentElement.dataset.contraste).toBeUndefined()
})

test('deveReduzirMovimento', async () => {
  const usuario = await abrir()

  await usuario.click(screen.getByRole('switch', { name: 'Reduzir movimento' }))

  expect(document.documentElement.dataset.movimento).toBe('reduzido')
})

test('deveRestaurarOPadrao', async () => {
  const usuario = await abrir()
  await usuario.click(screen.getByRole('radio', { name: 'Muito grande' }))
  await usuario.click(screen.getByRole('switch', { name: 'Alto contraste' }))

  await usuario.click(screen.getByRole('button', { name: 'Restaurar padrão' }))

  expect(document.documentElement.style.fontSize).toBe('100%')
  expect(document.documentElement.dataset.contraste).toBeUndefined()
  expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked()
})

test('deveMostrarEstadoSalvoAoReabrir', async () => {
  localStorage.setItem(
    'fisiotech.acessibilidade',
    JSON.stringify({ tamanho: 'grande', altoContraste: true, semMovimento: false }),
  )
  await abrir()

  expect(screen.getByRole('radio', { name: 'Grande' })).toBeChecked()
  expect(screen.getByRole('switch', { name: 'Alto contraste' })).toBeChecked()
})

test('deveSerAcessivelSemViolacoes', async () => {
  await abrir()

  expect(await axe(document.body)).toHaveNoViolations()
})
