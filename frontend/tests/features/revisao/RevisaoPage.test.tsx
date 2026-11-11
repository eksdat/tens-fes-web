import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { axe } from 'vitest-axe'
import * as api from '@/features/revisao/api'
import type { ConteudoEmRevisao } from '@/features/revisao/api'
import { RevisaoPage } from '@/features/revisao/RevisaoPage'
import { RegiaoToasts } from '@/shared/ui/Toasts'
import { renderComRotas } from '../../renderComRotas'

function conteudo(id: number, titulo: string, extra: Partial<ConteudoEmRevisao> = {}): ConteudoEmRevisao {
  return {
    id,
    titulo,
    modalidade: 'TENS',
    secao: 'VISAO_GERAL',
    bloco: 'O_QUE_E',
    corpo: 'Texto do guia técnico.',
    referencias: '[R1] Johnson, 2007',
    versao: 1,
    estado: 'EM_REVISAO',
    dataRevisao: null,
    motivoDevolucao: null,
    ...extra,
  }
}

const FILA = [
  conteudo(1, 'O que é TENS'),
  conteudo(2, 'Cuidados', { bloco: 'CUIDADOS', referencias: null }),
  conteudo(3, 'Caso do pé caído', { modalidade: 'FES', secao: 'CASOS', bloco: null }),
]

function erroDaApi(status: number, data: object) {
  return Object.assign(new Error(String(status)), { isAxiosError: true, response: { status, data } })
}

function renderizar() {
  return renderComRotas(
    <Route
      path="/revisao"
      element={
        <main>
          <RegiaoToasts />
          <RevisaoPage />
        </main>
      }
    />,
    '/revisao',
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(api, 'listarEmRevisao').mockResolvedValue(FILA)
})

test('deveAgruparAFilaPorModuloEAba', async () => {
  renderizar()

  const tens = within(await screen.findByRole('region', { name: 'TENS · Visão geral' }))
  expect(tens.getByRole('heading', { name: 'O que é TENS' })).toBeInTheDocument()
  expect(tens.getByRole('heading', { name: 'Cuidados' })).toBeInTheDocument()
  const fes = within(screen.getByRole('region', { name: 'FES · Casos' }))
  expect(fes.getByRole('heading', { name: 'Caso do pé caído' })).toBeInTheDocument()
  expect(screen.getByText('3 textos esperando revisão.')).toBeInTheDocument()
})

test('deveMostrarOBlocoEAFonteDeCadaTexto', async () => {
  renderizar()

  const item = within(await screen.findByRole('article', { name: 'O que é TENS' }))
  expect(item.getByText('O que é · versão 1')).toBeInTheDocument()
  expect(item.getByText('[R1] Johnson, 2007')).toBeInTheDocument()
  expect(screen.getByRole('article', { name: 'Cuidados' })).toHaveTextContent(/nenhuma informada/)
})

test('deveAprovarDeixandoOResultadoNoLugarDosBotoes', async () => {
  vi.spyOn(api, 'aprovarConteudo').mockResolvedValue(
    conteudo(1, 'O que é TENS', { estado: 'APROVADO', dataRevisao: '2026-11-11' }),
  )
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Aprovar O que é TENS' }))

  expect(api.aprovarConteudo).toHaveBeenCalledWith(1)
  expect(await screen.findByText('Aprovado em 11/11/2026.')).toHaveFocus()
  expect(screen.getByText('Conteúdo aprovado')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Aprovar O que é TENS' })).not.toBeInTheDocument()
  expect(screen.getByText('2 textos esperando revisão.')).toBeInTheDocument()
})

test('deveExigirOMotivoParaDevolver', async () => {
  const devolver = vi.spyOn(api, 'devolverConteudo')
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Devolver Caso do pé caído' }))
  await usuario.click(screen.getByRole('button', { name: 'Devolver para rascunho' }))

  expect(await screen.findByText('Escreva o motivo da devolução.')).toBeInTheDocument()
  expect(screen.getByLabelText('Motivo da devolução')).toHaveAttribute('aria-invalid', 'true')
  expect(devolver).not.toHaveBeenCalled()
})

test('deveDevolverComOMotivoEFecharODialogo', async () => {
  vi.spyOn(api, 'devolverConteudo').mockResolvedValue(
    conteudo(3, 'Caso do pé caído', { estado: 'RASCUNHO', motivoDevolucao: 'Falta a fonte do caso.' }),
  )
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Devolver Caso do pé caído' }))
  await usuario.type(screen.getByLabelText('Motivo da devolução'), 'Falta a fonte do caso.')
  await usuario.click(screen.getByRole('button', { name: 'Devolver para rascunho' }))

  expect(api.devolverConteudo).toHaveBeenCalledWith(3, 'Falta a fonte do caso.')
  expect(await screen.findByText('Devolvido para rascunho. Motivo: Falta a fonte do caso.')).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('Conteúdo devolvido')).toBeInTheDocument()
})

test('deveMostrarAExplicacaoDaApiQuandoOAutorTentaAprovar', async () => {
  vi.spyOn(api, 'aprovarConteudo').mockRejectedValue(
    erroDaApi(403, { detail: 'Quem escreveu o conteúdo não pode revisá-lo.' }),
  )
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Aprovar O que é TENS' }))

  const item = within(screen.getByRole('article', { name: 'O que é TENS' }))
  expect(await item.findByText('Quem escreveu o conteúdo não pode revisá-lo.')).toBeInTheDocument()
  expect(item.getByRole('button', { name: 'Aprovar O que é TENS' })).toBeEnabled()
})

test('deveManterODialogoAbertoSeADevolucaoFalhar', async () => {
  vi.spyOn(api, 'devolverConteudo').mockRejectedValue(
    erroDaApi(409, { detail: 'Este conteúdo não está mais em revisão.' }),
  )
  renderizar()
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Devolver Caso do pé caído' }))
  await usuario.type(screen.getByLabelText('Motivo da devolução'), 'Rever o caso.')
  await usuario.click(screen.getByRole('button', { name: 'Devolver para rascunho' }))

  expect(await screen.findByText('Este conteúdo não está mais em revisão.')).toBeInTheDocument()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('deveAvisarQuandoNaoHaNadaParaRevisar', async () => {
  vi.spyOn(api, 'listarEmRevisao').mockResolvedValue([])
  renderizar()

  expect(await screen.findByText('Nenhum conteúdo esperando revisão.')).toBeInTheDocument()
})

test('deveAvisarQuandoAFilaNaoCarrega', async () => {
  vi.spyOn(api, 'listarEmRevisao').mockRejectedValue(new Error('rede'))
  renderizar()

  expect(await screen.findByText('Não foi possível carregar a fila de revisão')).toBeInTheDocument()
})

test('deveSerAcessivelSemViolacoes', async () => {
  const { container } = renderizar()
  await screen.findByRole('heading', { name: 'O que é TENS' })

  expect(await axe(container)).toHaveNoViolations()
})
