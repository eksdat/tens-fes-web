import type { Page } from '@playwright/test'
import { expect, test } from './apoio/fixtures'
import { GANCHO, SININHO, WENDY } from './apoio/dados'

// Wendy: fisioterapeuta e professora, revisa o conteúdo antes de publicar. "Conteúdo sem fonte não entra."

async function abrirARevisao(page: Page) {
  await page.getByRole('button', { name: /Wendy Darling/ }).click()
  await page.getByRole('menuitem', { name: 'Revisar conteúdo' }).click()
  await expect(page.getByRole('heading', { name: 'Revisão de conteúdo', level: 1 })).toBeVisible()
}

test('deveAprovarOsCincoBlocosELiberarAVisaoGeralDoTens', async ({ page, entrarComo }) => {
  await entrarComo(WENDY)
  await abrirARevisao(page)
  await expect(page.getByText('11 textos esperando revisão.')).toBeVisible()

  const tens = page.getByRole('region', { name: 'TENS · Visão geral' })
  for (const titulo of ['O que é TENS', 'Para que serve', 'Como interpretar', 'Exemplo didático', 'Cuidados']) {
    await tens.getByRole('button', { name: `Aprovar ${titulo}` }).click()
    await expect(tens.getByRole('article', { name: titulo })).toContainText('Aprovado em')
  }
  await expect(page.getByText('6 textos esperando revisão.')).toBeVisible()

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'TENS' }).click()
  await expect(page.getByRole('heading', { name: 'O que é TENS' })).toBeVisible()
  await expect(page.getByText('Conteúdo ainda não liberado')).toHaveCount(0)
  await expect(page.getByText(/^Revisão docente: \d{2}\/\d{2}\/\d{4}\.$/)).toBeVisible()
})

test('deveDevolverOCasoSemFonteComOMotivo', async ({ page, entrarComo, api }) => {
  await entrarComo(WENDY)
  await abrirARevisao(page)
  const caso = page.getByRole('article', { name: 'Caso do pé caído' })
  await expect(caso).toContainText('nenhuma informada')

  await caso.getByRole('button', { name: 'Devolver Caso do pé caído' }).click()
  const dialogo = page.getByRole('dialog', { name: 'Devolver para rascunho?' })
  await dialogo.getByRole('button', { name: 'Devolver para rascunho' }).click()
  await expect(dialogo.getByText('Escreva o motivo da devolução.')).toBeVisible()
  await dialogo.getByLabel('Motivo da devolução').fill('Caso sem fonte. Inclua a referência do guia.')
  await dialogo.getByRole('button', { name: 'Devolver para rascunho' }).click()

  await expect(dialogo).toHaveCount(0)
  await expect(caso).toContainText('Devolvido para rascunho. Motivo: Caso sem fonte. Inclua a referência do guia.')
  expect(api.conteudos.find((c) => c.titulo === 'Caso do pé caído')).toMatchObject({
    estado: 'RASCUNHO',
    motivoDevolucao: 'Caso sem fonte. Inclua a referência do guia.',
  })
})

test('deveEsconderARevisaoDoProfissionalQueNaoERevisor', async ({ page, entrarComo }) => {
  await entrarComo(GANCHO)

  await page.getByRole('button', { name: /Capitão Gancho/ }).click()
  await expect(page.getByRole('menuitem', { name: 'Meu perfil' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Revisar conteúdo' })).toHaveCount(0)

  await page.goto('/revisao')
  await expect(page).toHaveURL('/')
})

test('deveLevarOEstudanteParaOInicioSeAbrirARevisao', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)

  await page.goto('/revisao')

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Revisão de conteúdo' })).toHaveCount(0)
})
