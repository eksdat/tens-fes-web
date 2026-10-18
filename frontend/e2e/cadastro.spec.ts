import { expect, test } from './apoio/fixtures'
import { PETER_PAN } from './apoio/dados'
import type { Page } from '@playwright/test'

// Peter Pan criando a conta de estudante. Do formulário até o primeiro acesso, passando pelo link do e-mail.

async function preencherCadastro(page: Page) {
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill(PETER_PAN.nome)
  await page.getByLabel('E-mail').fill(PETER_PAN.email)
  await page.getByLabel('Senha', { exact: true }).fill(PETER_PAN.senha)
  await page.getByLabel('Confirme a senha', { exact: true }).fill(PETER_PAN.senha)
  await page.getByLabel(/Li e aceito os/).check()
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()

  await page.getByRole('radio', { name: /Estudante/ }).check()
  await page.getByLabel('Instituição de ensino').fill('UniBH')
  await page.getByLabel('Período').selectOption('3')
  await page.getByRole('button', { name: 'Criar conta' }).click()
}

test('deveCriarContaConfirmarOEmailEEntrar', async ({ page, supabase }) => {
  await preencherCadastro(page)

  await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeVisible()
  expect(supabase.cadastrosRecebidos).toEqual([
    {
      email: PETER_PAN.email,
      dados: {
        cadastro: { nome: 'Peter Pan', aceiteTermos: true, perfil: 'ESTUDANTE', instituicao: 'UniBH', periodo: 3 },
      },
    },
  ])

  // Clicou no link do e-mail: a tela termina o cadastro sozinha com os dados guardados na criação da conta.
  await page.goto(supabase.linkDeConfirmacao(PETER_PAN.email))

  await expect(page.getByRole('heading', { name: 'Cadastro concluído' })).toBeVisible()
  await page.getByRole('link', { name: 'Continuar', exact: true }).click()
  await expect(page.getByText('Olá, Peter')).toBeVisible()
})

test('deveImpedirEntrarAntesDeConfirmarOEmail', async ({ page }) => {
  await preencherCadastro(page)
  await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeVisible()

  await page.getByRole('link', { name: 'Ir para entrar' }).click()
  await page.getByLabel('E-mail').fill(PETER_PAN.email)
  await page.getByLabel('Senha', { exact: true }).fill(PETER_PAN.senha)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page.getByText('Confirme seu e-mail antes de entrar')).toBeVisible()
})

test('deveExigirOAceiteDosTermosParaContinuar', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill(PETER_PAN.nome)
  await page.getByLabel('E-mail').fill(PETER_PAN.email)
  await page.getByLabel('Senha', { exact: true }).fill(PETER_PAN.senha)
  await page.getByLabel('Confirme a senha', { exact: true }).fill(PETER_PAN.senha)

  await page.getByRole('button', { name: 'Continuar', exact: true }).click()

  await expect(page.getByText('Aceite os termos de uso e a política de privacidade')).toBeVisible()
  await expect(page.getByRole('radio', { name: /Estudante/ })).toHaveCount(0)
})
