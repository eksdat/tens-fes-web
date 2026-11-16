import { expect, test } from './apoio/fixtures'
import { PDF_DE_TESTE, SININHO, WENDY } from './apoio/dados'
import { URL_SUPABASE } from './apoio/enderecos'

// Sininho monta um resumo de TENS para a turma e manda para a revisão; Wendy, a revisora, confere o anexo.

const TEXTO = 'Convencional: 50 a 100 Hz e 50 a 200 µs. Sensação forte e confortável; dor < 5 no exemplo fictício.'

test('deveCriarAnexarEEnviarOMaterialParaRevisao', async ({ page, entrarComo, api }) => {
  await entrarComo(SININHO)
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Criar conteúdo' }).click()
  await expect(page.getByText('Você ainda não criou nenhum material.')).toBeVisible()
  await page.getByRole('link', { name: 'Novo material' }).click()

  await expect(page.getByText('Publicar um anexo não equivale a validá-lo clinicamente.')).toBeVisible()
  await expect(page.getByText('Não anexe prontuários ou dados de pacientes reais.')).toBeVisible()
  await page.getByLabel('Título').fill('Resumo: TENS convencional')
  await page.getByLabel('Modalidade').selectOption('TENS')
  await page.getByLabel('Tema').selectOption({ label: 'Parâmetros' })
  await page.getByLabel('Texto', { exact: true }).fill(TEXTO)
  await page.getByLabel('Referências (opcional)').fill('[R1] Johnson, 2007')
  await page.getByRole('button', { name: 'Salvar rascunho' }).click()

  await expect(page.getByText('Rascunho salvo', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/criar-conteudo\/\d+$/)

  // O tipo vale pelo conteúdo do arquivo: texto com nome de PDF é recusado.
  await page.getByLabel('Anexar arquivo').setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('anotações') })
  await expect(page.getByText('Envie um PDF ou uma imagem PNG ou JPEG.')).toBeVisible()
  await page.getByLabel('Anexar arquivo').setInputFiles({ name: 'resumo.pdf', mimeType: 'application/pdf', buffer: PDF_DE_TESTE })
  await expect(page.getByText('Arquivo anexado', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Anexos' }).getByText('resumo.pdf')).toBeVisible()

  await page.getByRole('button', { name: 'Enviar para revisão' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Enviar', exact: true }).click()

  await expect(page.getByText('Enviado para revisão', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Resumo: TENS convencional', level: 1 })).toBeVisible()
  await expect(page.getByText('Em revisão', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Anexar arquivo')).toHaveCount(0)

  const material = api.conteudos.find((c) => c.titulo === 'Resumo: TENS convencional')
  expect(material).toMatchObject({ estado: 'EM_REVISAO', autorId: SININHO.id, secao: 'PARAMETROS', bloco: null })
  expect(material?.anexos).toMatchObject([{ nome: 'resumo.pdf', tipo: 'PDF', tamanhoBytes: PDF_DE_TESTE.length }])
})

test('deveDeixarARevisoraAbrirOAnexoEDevolverComMotivo', async ({ page, entrarComo, api }) => {
  const material = api.adicionarMaterial(
    SININHO,
    { titulo: 'Resumo: TENS convencional', modalidade: 'TENS', secao: 'PARAMETROS', corpo: TEXTO, estado: 'EM_REVISAO' },
    ['resumo.pdf'],
  )
  // O link assinado aponta para o Supabase Storage; aqui ele responde um arquivo qualquer.
  await page.context().route(`${URL_SUPABASE}/storage/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'anexo de teste' }),
  )
  await entrarComo(WENDY)
  await page.goto('/revisao')

  const item = page.getByRole('article', { name: 'Resumo: TENS convencional' })
  await expect(item.getByText('Material de estudo · versão 1')).toBeVisible()
  const [aba] = await Promise.all([page.waitForEvent('popup'), item.getByRole('button', { name: 'Abrir resumo.pdf' }).click()])
  await aba.waitForURL(/\/storage\/v1\/object\/sign\/materiais\//)
  await aba.close()

  await item.getByRole('button', { name: 'Devolver Resumo: TENS convencional' }).click()
  await page.getByLabel('Motivo da devolução').fill('Cite a fonte da faixa de largura de pulso.')
  await page.getByRole('button', { name: 'Devolver para rascunho' }).click()

  await expect(item).toContainText('Devolvido para rascunho. Motivo: Cite a fonte da faixa de largura de pulso.')
  expect(material).toMatchObject({ estado: 'RASCUNHO', motivoDevolucao: 'Cite a fonte da faixa de largura de pulso.' })
})

test('naoDeveMostrarORascunhoDeOutraPessoa', async ({ page, entrarComo, api }) => {
  const material = api.adicionarMaterial(SININHO, {
    titulo: 'Rascunho da Sininho',
    modalidade: 'FES',
    secao: 'CASOS',
    corpo: 'Texto em construção.',
    estado: 'RASCUNHO',
  })
  await entrarComo(WENDY)

  await page.goto('/criar-conteudo')
  await expect(page.getByText('Você ainda não criou nenhum material.')).toBeVisible()
  await page.goto(`/criar-conteudo/${material.id}`)
  await expect(page.getByText('Material não encontrado')).toBeVisible()
})
