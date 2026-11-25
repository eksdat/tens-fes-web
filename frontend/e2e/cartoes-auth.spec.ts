import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './apoio/fixtures'
import { GANCHO, SININHO } from './apoio/dados'
import { URL_API } from './apoio/enderecos'
import { liberarPreflight, responder } from './apoio/http'

test('deve encerrar a sessão e avisar quando a API rejeita o token', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)
  await page.route(`${URL_API}/api/v1/usuarios/me`, (route) =>
    route.request().method() === 'OPTIONS' ? liberarPreflight(route) : responder(route, 401),
  )
  await page.reload()
  await expect(page).toHaveURL('/login')
  await expect(page.getByText('Sua sessão expirou. Entre novamente.', { exact: true })).toBeVisible()
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

test('deve oferecer acesso clínico no início profissional', async ({ page, entrarComo }) => {
  await entrarComo(GANCHO)
  await expect(page.getByRole('heading', { name: 'Prática clínica', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Abrir pacientes' })).toHaveAttribute('href', '/pacientes')
})

test('deve recuperar a senha pelo teclado com formulários acessíveis', async ({ page, supabase }) => {
  supabase.adicionar(SININHO)
  await page.goto('/esqueci-senha')
  const email = page.getByRole('textbox', { name: 'E-mail' })
  await email.focus()
  await page.keyboard.insertText(SININHO.email)
  const pedido = page.waitForRequest((r) => r.method() === 'POST' && r.url().includes('/auth/v1/recover'))
  await page.keyboard.press('Enter')
  expect(new URL((await pedido).url()).searchParams.get('redirect_to')).toBe(new URL('/nova-senha', page.url()).href)
  await expect(page.getByRole('status').filter({ hasText: 'Confira seu e-mail' })).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.goto(supabase.linkDeRecuperacao(SININHO.email))
  const senha = 'Verde-Trem-Oceano#58'
  await page.getByLabel('Nova senha', { exact: true }).fill(senha)
  await page.getByLabel('Confirme a nova senha').fill(senha)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status').filter({ hasText: 'Senha alterada' })).toBeVisible()
  expect(supabase.conta(SININHO.id)?.senha).toBe(senha)
})

test('deve mostrar o início de estudo para estudantes', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)
  await expect(page.getByRole('heading', { name: 'Aprenda TENS e FES' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Começar pelo TENS' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Prática clínica', exact: true })).toHaveCount(0)
})
