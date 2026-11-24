import { expect, test } from './apoio/fixtures'
import { SININHO } from './apoio/dados'

// Sininho: estudante, usa a plataforma no celular entre as aulas.

test('deveLevarParaOLoginQuemAindaNaoEntrou', async ({ page }) => {
  await page.goto('/tens')

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

test('deveAvisarQuandoASenhaEstaErrada', async ({ page, supabase }) => {
  supabase.adicionar(SININHO)
  await page.goto('/login')

  await page.getByLabel('E-mail').fill(SININHO.email)
  await page.getByLabel('Senha', { exact: true }).fill('Senha-Errada-123!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
  await expect(page).toHaveURL('/login')
})

test('deveEntrarComoEstudanteEVerOInicioDoPerfil', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Olá, Sininho')).toBeVisible()
  const menu = page.getByRole('navigation', { name: 'Principal' })
  await expect(menu.getByRole('link', { name: 'TENS' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'FES' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Pacientes' })).toHaveCount(0)
})

test('deveManterOEstudanteForaDaAreaDePacientes', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)

  await page.goto('/pacientes')

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Pacientes' })).toHaveCount(0)
})

test('deveContinuarLogadoAoRecarregarAPagina', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)

  await page.reload()

  await expect(page.getByText('Olá, Sininho')).toBeVisible()
})

test('deveSairPeloMenuDaConta', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)

  await page.getByRole('button', { name: /Sininho/ }).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()

  await expect(page).toHaveURL('/login')
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})
