import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet, Route } from 'react-router'
import { axe } from 'vitest-axe'
import * as api from '@/features/material/api'
import type { Anexo } from '@/features/material/api'
import { MaterialFormPage } from '@/features/material/MaterialFormPage'
import { RegiaoToasts } from '@/shared/ui/Toasts'
import { renderComRotas } from '../../renderComRotas'
import { material } from './dados'

const ANEXO: Anexo = { id: 'a1', nome: 'aula.pdf', tipo: 'PDF', tamanhoBytes: 2048, criadoEm: '2026-11-10T15:00:00Z' }

function renderizar(rota: string) {
  return renderComRotas(
    <Route element={<><RegiaoToasts /><main><Outlet /></main></>}>
      <Route path="/criar-conteudo" element={<p>lista</p>} />
      <Route path="/criar-conteudo/novo" element={<MaterialFormPage />} />
      <Route path="/criar-conteudo/:id" element={<MaterialFormPage />} />
    </Route>,
    rota,
  )
}

function pdf(nome = 'aula.pdf', tamanho?: number) {
  const f = new File(['%PDF-1.7'], nome, { type: 'application/pdf' })
  if (tamanho !== undefined) Object.defineProperty(f, 'size', { value: tamanho })
  return f
}

async function preencher(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText('Título'), 'Resumo de TENS')
  await usuario.selectOptions(screen.getByLabelText('Modalidade'), 'TENS')
  await usuario.selectOptions(screen.getByLabelText('Tema'), 'PARAMETROS')
  await usuario.type(screen.getByLabelText('Texto'), 'Frequência de 50 a 100 Hz; dor < 5 no exemplo.')
}

beforeEach(() => {
  vi.restoreAllMocks()
})

test('deveMostrarOsDoisAvisosDoFormulario', () => {
  renderizar('/criar-conteudo/novo')

  expect(screen.getByText('Publicar um anexo não equivale a validá-lo clinicamente.')).toBeInTheDocument()
  expect(screen.getByText('Não anexe prontuários ou dados de pacientes reais.')).toBeInTheDocument()
  expect(screen.getByText('Salve o rascunho para anexar arquivos.')).toBeInTheDocument()
})

test('deveCriarORascunhoEIrParaAPaginaDeleParaAnexar', async () => {
  const criar = vi.spyOn(api, 'criarMaterial').mockResolvedValue(material(7, 'Resumo de TENS'))
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS'))
  renderizar('/criar-conteudo/novo')
  const usuario = userEvent.setup()

  await preencher(usuario)
  await usuario.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

  await waitFor(() => expect(criar).toHaveBeenCalled())
  expect(criar.mock.calls[0][0]).toEqual({
    titulo: 'Resumo de TENS',
    modalidade: 'TENS',
    secao: 'PARAMETROS',
    corpo: 'Frequência de 50 a 100 Hz; dor < 5 no exemplo.',
    referencias: null,
  })
  expect(await screen.findByRole('heading', { name: 'Editar material' })).toBeInTheDocument()
  expect(screen.getByLabelText('Anexar arquivo')).toBeInTheDocument()
})

test('deveExigirOsCamposERecusarHtml', async () => {
  const criar = vi.spyOn(api, 'criarMaterial')
  renderizar('/criar-conteudo/novo')
  const usuario = userEvent.setup()

  await usuario.type(screen.getByLabelText('Texto'), '<script>alert(1)</script>')
  await usuario.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

  expect(await screen.findByText('Use de 2 a 200 caracteres.')).toBeInTheDocument()
  expect(screen.getByText('Escolha a modalidade.')).toBeInTheDocument()
  expect(screen.getByText('Escolha o tema.')).toBeInTheDocument()
  expect(screen.getByText('Use texto simples ou Markdown, sem HTML.')).toBeInTheDocument()
  expect(criar).not.toHaveBeenCalled()
})

test('deveAnexarPdfERecusarArquivoErradoAntesDeEnviar', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS'))
  const anexar = vi.spyOn(api, 'anexarArquivo').mockResolvedValue(ANEXO)
  renderizar('/criar-conteudo/7')
  const usuario = userEvent.setup({ applyAccept: false })
  const entrada = await screen.findByLabelText('Anexar arquivo')

  await usuario.upload(entrada, new File(['texto'], 'notas.txt', { type: 'text/plain' }))
  expect(await screen.findByText('Envie um PDF ou uma imagem PNG ou JPEG.')).toBeInTheDocument()
  await usuario.upload(entrada, pdf('grande.pdf', 10 * 1024 * 1024 + 1))
  expect(await screen.findByText('O arquivo passa de 10 MB.')).toBeInTheDocument()
  expect(anexar).not.toHaveBeenCalled()

  await usuario.upload(entrada, pdf())
  await waitFor(() => expect(anexar).toHaveBeenCalledWith(7, expect.any(File)))
  expect(await screen.findByText('Arquivo anexado')).toBeInTheDocument()
})

test('deveMostrarOMotivoQuandoOServidorRecusaOArquivo', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS'))
  vi.spyOn(api, 'anexarArquivo').mockRejectedValue(
    Object.assign(new Error('400'), {
      isAxiosError: true,
      response: { status: 400, data: { erros: { arquivo: 'Envie um PDF ou uma imagem PNG ou JPEG.' } } },
    }),
  )
  renderizar('/criar-conteudo/7')
  const usuario = userEvent.setup()

  await usuario.upload(await screen.findByLabelText('Anexar arquivo'), pdf('renomeado.pdf'))

  expect(await screen.findByText('Envie um PDF ou uma imagem PNG ou JPEG.')).toBeInTheDocument()
})

test('deveListarRemoverEAbrirOsAnexos', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS', { anexos: [ANEXO] }))
  const remover = vi.spyOn(api, 'removerAnexo').mockResolvedValue()
  const link = vi.spyOn(api, 'linkDoAnexo').mockResolvedValue({ url: 'https://exemplo.supabase.co/x.pdf?token=t', expiraEm: '' })
  const aba = { opener: {}, location: { href: '' }, close: vi.fn() }
  vi.spyOn(window, 'open').mockReturnValue(aba as unknown as Window)
  renderizar('/criar-conteudo/7')
  const usuario = userEvent.setup()

  const anexos = within(await screen.findByRole('region', { name: 'Anexos' }))
  expect(anexos.getByText('PDF · 2,0 kB')).toBeInTheDocument()
  await usuario.click(anexos.getByRole('button', { name: 'Abrir aula.pdf' }))
  expect(link).toHaveBeenCalledWith(7, 'a1')
  expect(aba.location.href).toBe('https://exemplo.supabase.co/x.pdf?token=t')

  await usuario.click(anexos.getByRole('button', { name: 'Remover aula.pdf' }))
  expect(remover).toHaveBeenCalledWith(7, 'a1')
})

test('deveBloquearOSextoAnexo', async () => {
  const cinco = ['1', '2', '3', '4', '5'].map((n) => ({ ...ANEXO, id: n, nome: `parte${n}.pdf` }))
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS', { anexos: cinco }))
  renderizar('/criar-conteudo/7')

  expect(await screen.findByLabelText('Anexar arquivo')).toBeDisabled()
  expect(screen.getByText('Limite de 5 anexos atingido. Remova um para anexar outro.')).toBeInTheDocument()
})

test('deveSalvarOQueEstaNaTelaEEnviarParaRevisaoDepoisDeConfirmar', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS'))
  const alterar = vi.spyOn(api, 'alterarMaterial').mockResolvedValue(material(7, 'Resumo de TENS revisto'))
  const enviar = vi.spyOn(api, 'enviarParaRevisao').mockResolvedValue(material(7, 'Resumo de TENS revisto', { estado: 'EM_REVISAO' }))
  renderizar('/criar-conteudo/7')
  const usuario = userEvent.setup()

  await usuario.type(await screen.findByLabelText('Título'), ' revisto')
  await usuario.click(screen.getByRole('button', { name: 'Enviar para revisão' }))
  const dialogo = within(await screen.findByRole('dialog'))
  expect(enviar).not.toHaveBeenCalled()
  await usuario.click(dialogo.getByRole('button', { name: 'Enviar' }))

  await waitFor(() => expect(enviar).toHaveBeenCalledWith(7))
  expect(alterar.mock.calls[0][1]).toMatchObject({ titulo: 'Resumo de TENS revisto' })
  expect(alterar.mock.invocationCallOrder[0]).toBeLessThan(enviar.mock.invocationCallOrder[0])
  expect(await screen.findByText('Enviado para revisão')).toBeInTheDocument()
})

test('deveMostrarOMotivoDaDevolucaoNoRascunho', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS', { motivoDevolucao: 'Cite a fonte da faixa.' }))
  renderizar('/criar-conteudo/7')

  expect(await screen.findByText('A revisão devolveu este material')).toBeInTheDocument()
  expect(screen.getByText('Cite a fonte da faixa.')).toBeInTheDocument()
  expect(screen.getByLabelText('Título')).toHaveValue('Resumo de TENS')
})

test('deveMostrarSoParaLerDepoisDeEnviado', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS', { estado: 'EM_REVISAO', anexos: [ANEXO] }))
  renderizar('/criar-conteudo/7')

  expect(await screen.findByRole('heading', { name: 'Resumo de TENS', level: 1 })).toBeInTheDocument()
  expect(screen.getByText('Em revisão')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Salvar rascunho' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Anexar arquivo')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Remover aula.pdf' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Abrir aula.pdf' })).toBeInTheDocument()
})

test('deveExcluirORascunhoDepoisDeConfirmar', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS'))
  const excluir = vi.spyOn(api, 'excluirMaterial').mockResolvedValue()
  renderizar('/criar-conteudo/7')
  const usuario = userEvent.setup()

  await usuario.click(await screen.findByRole('button', { name: 'Excluir rascunho' }))
  await usuario.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Excluir' }))

  await waitFor(() => expect(excluir).toHaveBeenCalledWith(7))
  expect(await screen.findByText('lista')).toBeInTheDocument()
})

test('deveAvisarQuandoOMaterialNaoExiste', async () => {
  vi.spyOn(api, 'buscarMaterial').mockRejectedValue(
    Object.assign(new Error('404'), { isAxiosError: true, response: { status: 404, data: { detail: 'Material não encontrado.' } } }),
  )
  renderizar('/criar-conteudo/99')

  expect(await screen.findByText('Material não encontrado')).toBeInTheDocument()
})

test('deveSerAcessivelSemViolacoes', async () => {
  vi.spyOn(api, 'buscarMaterial').mockResolvedValue(material(7, 'Resumo de TENS', { anexos: [ANEXO] }))
  renderizar('/criar-conteudo/7')
  await screen.findByRole('region', { name: 'Anexos' })

  expect(await axe(document.body)).toHaveNoViolations()
})
