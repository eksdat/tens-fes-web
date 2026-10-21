import AxeBuilder from '@axe-core/playwright'
import type { Locator, Page } from '@playwright/test'
import { expect, test } from './apoio/fixtures'
import { GANCHO, PETER_PAN, SININHO } from './apoio/dados'

// Peter Pan usa só teclado e leitor de tela. Meta do projeto: WCAG 2.2 nível AA.

const REGRAS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Roda o axe na tela inteira e devolve as violações num formato fácil de ler no relatório. */
async function violacoes(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(REGRAS_WCAG).analyze()
  return resultado.violations.map((v) => `${v.id} (${v.impact}): ${v.help}. Em: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/** Aperta Tab até o foco chegar no elemento. Falha se não chegar: o elemento não é alcançável pelo teclado. */
async function tabAte(page: Page, alvo: Locator, limite = 25) {
  for (let i = 0; i < limite; i++) {
    await page.keyboard.press('Tab')
    if (await alvo.evaluate((el) => el === document.activeElement)) return
  }
  throw new Error(`O foco não chegou em ${alvo} usando só o Tab`)
}

test('devePermitirEntrarEEstudarSoComOTeclado', async ({ page, supabase }) => {
  supabase.adicionar(PETER_PAN)
  await page.goto('/login')

  await tabAte(page, page.getByLabel('E-mail'))
  await page.keyboard.type(PETER_PAN.email)
  await tabAte(page, page.getByLabel('Senha', { exact: true }))
  await page.keyboard.type(PETER_PAN.senha)
  await tabAte(page, page.getByRole('button', { name: 'Entrar', exact: true }))
  await page.keyboard.press('Enter')
  await expect(page.getByText('Olá, Peter')).toBeVisible()

  await tabAte(page, page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'FES' }))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/fes')
  await expect(page).toHaveTitle('FES · Visão geral · Fisiotech')
})

test('deveLevarOFocoParaOConteudoPeloLinkDePular', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)
  await page.goto('/tens')
  await expect(page.getByRole('heading', { name: 'Alívio da dor' })).toBeVisible()

  await page.keyboard.press('Tab')
  const pular = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(pular).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page.locator('main#conteudo')).toBeFocused()
})

test.describe('telas sem violações de acessibilidade', () => {
  for (const tela of ['/login', '/cadastro']) {
    test(`deveCumprirAWcagNaTela ${tela}`, async ({ page }) => {
      await page.goto(tela)
      await expect(page.locator('h1')).toBeVisible()

      expect(await violacoes(page)).toEqual([])
    })
  }

  for (const tela of ['/', '/tens', '/fes/eletrodos?regiao=quadriceps', '/tens/seguranca', '/simulador']) {
    test(`deveCumprirAWcagNaTela ${tela} do estudante`, async ({ page, entrarComo }) => {
      await entrarComo(SININHO)
      await page.goto(tela)
      await expect(page.locator('h1')).toBeVisible()

      expect(await violacoes(page)).toEqual([])
    })
  }

  for (const tela of ['/pacientes', '/pacientes/novo']) {
    test(`deveCumprirAWcagNaTela ${tela} do profissional`, async ({ page, entrarComo }) => {
      await entrarComo(GANCHO)
      await page.goto(tela)
      await expect(page.locator('h1')).toBeVisible()

      expect(await violacoes(page)).toEqual([])
    })
  }
})
