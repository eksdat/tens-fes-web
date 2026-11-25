import { join } from 'node:path'
import { SININHO } from './apoio/dados'
import { expect, test } from './apoio/fixtures'

test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } })

test.beforeEach(async ({ entrarComo }) => {
  await entrarComo(SININHO)
})

test('deveSelecionarTeclasEConectoresNaSuperficieDoAparelho', async ({ page }, info) => {
  await page.goto('/tens/aparelho')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
  const visor = page.locator('.tf-visor-aparelho')
  const modelo = visor.locator('canvas')
  await expect(modelo).toBeVisible()
  await visor.getByRole('button', { name: 'Frente' }).click()
  const largura = await modelo.evaluate((c) => c.clientWidth)
  await modelo.click({ position: { x: largura / 2 + 6, y: 198 } })
  await expect(page.getByRole('button', { name: /Tecla START\/STOP/ })).toHaveAttribute('aria-expanded', 'true')

  const pasta = process.env.FISIOTECH_PRINTS
  if (pasta) {
    const nome = info.project.name === 'celular' ? '06-aparelho-frente-celular.png' : '01-aparelho-frente.png'
    await visor.screenshot({ path: join(pasta, nome) })
  }

  await visor.getByRole('button', { name: 'Canais' }).click()
  await modelo.click({ position: { x: largura / 2, y: 144 } })
  await expect(page.getByRole('button', { name: /Conector do cabo do canal 1/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  if (pasta && info.project.name === 'computador') {
    await visor.screenshot({ path: join(pasta, '02-aparelho-canais.png') })
  }
})

test('deveMostrarEletrodosNoAtlasEAmpliarARegiao', async ({ page }, info) => {
  await page.goto('/fes/eletrodos')
  const pasta = process.env.FISIOTECH_PRINTS
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
  if (pasta) {
    const nome = info.project.name === 'celular' ? '07-atlas-frente-costas-celular.png' : '03-atlas-frente-costas.png'
    await page.locator('.tf-corpos').screenshot({ path: join(pasta, nome) })
  }

  await page.getByRole('button', { name: 'Quadríceps' }).click()
  const regiao = page.locator('.tf-foto-regiao')
  const imagem = regiao.locator('svg')
  await regiao.getByRole('button', { name: 'Eletrodo 1A' }).click()
  await expect(regiao.getByText(/1A · canal 1 · Região proximal anterior/)).toBeVisible()

  if (pasta && info.project.name === 'celular') {
    await regiao.screenshot({ path: join(pasta, '04-atlas-quadriceps-celular.png') })
  }

  const antes = await imagem.getAttribute('viewBox')
  if (info.project.name === 'celular') {
    await imagem.scrollIntoViewIfNeeded()
    const caixa = (await imagem.boundingBox())!
    const x = caixa.x + caixa.width / 2
    const y = caixa.y + caixa.height / 2
    const cdp = await page.context().newCDPSession(page)
    const dedos = (distancia: number) => [
      { x: x - distancia, y, id: 1 },
      { x: x + distancia, y, id: 2 },
    ]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: dedos(25) })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: dedos(55) })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await regiao.getByRole('button', { name: 'Ampliar região' }).click()
  }
  await expect(imagem).not.toHaveAttribute('viewBox', antes!)

  if (pasta && info.project.name === 'computador') {
    await page.goto('/tens/eletrodos?regiao=lombar')
    await expect(regiao.getByRole('button', { name: 'Eletrodo 2B' })).toBeVisible()
    await regiao.screenshot({ path: join(pasta, '05-atlas-lombar-costas.png') })
  }
})
