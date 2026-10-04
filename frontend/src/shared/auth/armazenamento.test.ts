import { armazenamentoDaSessao, definirManterConectado } from './armazenamento'

const CHAVE = 'sb-sessao'

test('deveGuardarNaAbaQuandoNaoMarcouManterConectado', () => {
  definirManterConectado(false)

  armazenamentoDaSessao.setItem(CHAVE, 'token')

  expect(sessionStorage.getItem(CHAVE)).toBe('token')
  expect(localStorage.getItem(CHAVE)).toBeNull()
})

test('deveGuardarNoNavegadorQuandoMarcouManterConectado', () => {
  definirManterConectado(true)

  armazenamentoDaSessao.setItem(CHAVE, 'token')

  expect(localStorage.getItem(CHAVE)).toBe('token')
  expect(sessionStorage.getItem(CHAVE)).toBeNull()
})

test('deveTrocarDeLugarQuandoAEscolhaMuda', () => {
  definirManterConectado(false)
  armazenamentoDaSessao.setItem(CHAVE, 'antigo')

  definirManterConectado(true)
  armazenamentoDaSessao.setItem(CHAVE, 'novo')

  expect(localStorage.getItem(CHAVE)).toBe('novo')
  expect(sessionStorage.getItem(CHAVE)).toBeNull()
})

test('deveLerDosDoisLugares', () => {
  localStorage.setItem(CHAVE, 'no-navegador')
  expect(armazenamentoDaSessao.getItem(CHAVE)).toBe('no-navegador')

  localStorage.clear()
  sessionStorage.setItem(CHAVE, 'na-aba')
  expect(armazenamentoDaSessao.getItem(CHAVE)).toBe('na-aba')
})

test('deveRemoverDosDoisLugares', () => {
  localStorage.setItem(CHAVE, 'a')
  sessionStorage.setItem(CHAVE, 'b')

  armazenamentoDaSessao.removeItem(CHAVE)

  expect(localStorage.getItem(CHAVE)).toBeNull()
  expect(sessionStorage.getItem(CHAVE)).toBeNull()
})
