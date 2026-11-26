import { expect, test } from './apoio/fixtures'
import { GANCHO, SININHO } from './apoio/dados'

test('deve abrir o atlas pelo Início do estudante', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)
  await page.getByRole('link', { name: 'Abrir o atlas de eletrodos' }).click()
  await expect(page).toHaveURL('/tens/eletrodos')
  await expect(page.getByRole('heading', { name: 'Eletrodos', level: 2 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Joelho', exact: true })).toBeVisible()
})

test('deve abrir os parâmetros de TENS pelo Início do estudante', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)
  await page.getByRole('link', { name: 'Abrir parâmetros de TENS' }).click()
  await expect(page).toHaveURL('/tens/parametros')
  await expect(page.getByRole('heading', { name: 'Parâmetros', level: 2 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Testar no simulador' })).toBeVisible()
})

test('deve abrir o atlas pelo Início do profissional', async ({ page, entrarComo }) => {
  await entrarComo(GANCHO)
  await page.getByRole('link', { name: 'Abrir o atlas de eletrodos' }).click()
  await expect(page).toHaveURL('/tens/eletrodos')
  await expect(page.getByRole('heading', { name: 'Eletrodos', level: 2 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Joelho', exact: true })).toBeVisible()
})

test('deve abrir a lista de pacientes pelo Início do profissional', async ({ page, entrarComo }) => {
  await entrarComo(GANCHO)
  await page.getByRole('link', { name: 'Abrir pacientes' }).click()
  await expect(page).toHaveURL('/pacientes')
  await expect(page.getByRole('heading', { name: 'Pacientes', level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Novo paciente' })).toBeVisible()
})
