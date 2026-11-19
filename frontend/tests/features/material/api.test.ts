import { conferirArquivo, formatarTamanho, lerErroMaterial, repetirSeNaoFor404, rotuloDoEstado } from '@/features/material/api'

function arquivo(nome: string, tamanho: number) {
  const f = new File(['%PDF-'], nome, { type: 'application/pdf' })
  Object.defineProperty(f, 'size', { value: tamanho })
  return f
}

function erroDaApi(status: number, data: object) {
  return Object.assign(new Error(String(status)), { isAxiosError: true, response: { status, data } })
}

test.each([
  ['resumo.pdf', 2048, null],
  ['FOTO.JPG', 2048, null],
  ['foto.jpeg', 2048, null],
  ['prancha.png', 10 * 1024 * 1024, null],
  ['notas.txt', 2048, 'Envie um PDF ou uma imagem PNG ou JPEG.'],
  ['planilha.pdf.exe', 2048, 'Envie um PDF ou uma imagem PNG ou JPEG.'],
  ['grande.pdf', 10 * 1024 * 1024 + 1, 'O arquivo passa de 10 MB.'],
  ['vazio.pdf', 0, 'O arquivo está vazio.'],
])('deveConferir %s com %i bytes', (nome, tamanho, esperado) => {
  expect(conferirArquivo(arquivo(nome, tamanho))).toBe(esperado)
})

test.each([
  [2048, '2,0 kB'],
  [1536, '1,5 kB'],
  [3 * 1024 * 1024, '3,0 MB'],
])('deveFormatar %i bytes como %s', (bytes, esperado) => {
  expect(formatarTamanho(bytes)).toBe(esperado)
})

test('deveChamarDeDevolvidoORascunhoQueVoltouDaRevisao', () => {
  expect(rotuloDoEstado({ estado: 'RASCUNHO', motivoDevolucao: 'Cite a fonte.' })).toBe('Devolvido')
  expect(rotuloDoEstado({ estado: 'RASCUNHO', motivoDevolucao: null })).toBe('Rascunho')
  expect(rotuloDoEstado({ estado: 'EM_REVISAO', motivoDevolucao: 'Cite a fonte.' })).toBe('Em revisão')
})

test('deveLerOsErrosDaApi', () => {
  expect(lerErroMaterial(erroDaApi(400, { erros: { corpo: 'Use texto simples ou Markdown, sem HTML.' } }))).toEqual({
    mensagem: 'Confira os campos destacados.',
    campos: { corpo: 'Use texto simples ou Markdown, sem HTML.' },
  })
  expect(lerErroMaterial(erroDaApi(409, { detail: 'Use até 5 anexos por material.' })).mensagem).toBe(
    'Use até 5 anexos por material.',
  )
  expect(lerErroMaterial(erroDaApi(413, {})).mensagem).toBe('O arquivo passa de 10 MB.')
  expect(lerErroMaterial(new Error('rede')).mensagem).toBe('Não foi possível salvar agora. Tente de novo em instantes.')
})

test('naoDeveRepetirABuscaQuandoOMaterialNaoExiste', () => {
  expect(repetirSeNaoFor404(0, erroDaApi(404, { detail: 'Material não encontrado.' }))).toBe(false)
  expect(repetirSeNaoFor404(0, new Error('rede'))).toBe(true)
  expect(repetirSeNaoFor404(3, new Error('rede'))).toBe(false)
})
