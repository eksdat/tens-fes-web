import { screen, within } from '@testing-library/react'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import * as api from '@/features/material/api'
import { MateriaisPage } from '@/features/material/MateriaisPage'
import { renderComRotas } from '../../renderComRotas'
import { material } from './dados'

function renderizar() {
  return renderComRotas(<Route path="/criar-conteudo" element={<main><MateriaisPage /></main>} />, '/criar-conteudo')
}

beforeEach(() => {
  vi.restoreAllMocks()
})

test('deveListarOsMateriaisDoAutorComOEstado', async () => {
  vi.spyOn(api, 'listarMateriais').mockResolvedValue([
    material(1, 'Resumo de TENS'),
    material(2, 'Mapa dos eletrodos', { estado: 'EM_REVISAO', secao: 'ELETRODOS', modalidade: 'FES' }),
    material(3, 'Casos de FES', { motivoDevolucao: 'Cite a fonte do exemplo.' }),
  ])
  renderizar()

  const lista = within(await screen.findByRole('list', { name: 'Seus materiais' }))
  const itens = lista.getAllByRole('listitem')
  expect(itens[0]).toHaveTextContent(/TENS · Parâmetros.*Resumo de TENS.*Rascunho/)
  expect(itens[1]).toHaveTextContent(/FES · Eletrodos.*Mapa dos eletrodos.*Em revisão/)
  expect(itens[2]).toHaveTextContent(/Devolvido.*Cite a fonte do exemplo\./)
  expect(lista.getByRole('link', { name: 'Resumo de TENS' })).toHaveAttribute('href', '/criar-conteudo/1')
})

test('deveConvidarACriarQuandoNaoHaMateriais', async () => {
  vi.spyOn(api, 'listarMateriais').mockResolvedValue([])
  renderizar()

  expect(await screen.findByText('Você ainda não criou nenhum material.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Novo material' })).toHaveAttribute('href', '/criar-conteudo/novo')
})

test('deveSerAcessivelSemViolacoes', async () => {
  vi.spyOn(api, 'listarMateriais').mockResolvedValue([material(1, 'Resumo de TENS', { motivoDevolucao: 'Cite a fonte.' })])
  renderizar()
  await screen.findByRole('list', { name: 'Seus materiais' })

  expect(await axe(document.body)).toHaveNoViolations()
})
