import { expect, test } from './apoio/fixtures'
import { SININHO } from './apoio/dados'

// Sininho estudando: módulos TENS e FES, atlas de eletrodos e simulador no modo explorar.

test.beforeEach(async ({ entrarComo }) => {
  await entrarComo(SININHO)
})

test('deveAvisarQueOConteudoAindaNaoFoiLiberado', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'TENS' }).click()

  await expect(page.getByRole('heading', { name: 'Alívio da dor', level: 1 })).toBeVisible()
  await expect(page.getByText('Conteúdo ainda não liberado')).toBeVisible()
  await expect(page.getByText('Revisão docente: pendente.')).toBeVisible()
})

test('deveMostrarOConteudoDepoisDaRevisaoDocente', async ({ page, api }) => {
  api.aprovarPagina('TENS', 'VISAO_GERAL')

  await page.goto('/tens')

  await expect(page.getByRole('heading', { name: 'O que é TENS' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cuidados' })).toBeVisible()
  await expect(page.getByText('Revisão docente: 15/10/2026.')).toBeVisible()
  await expect(page.getByText('Conteúdo ainda não liberado')).toHaveCount(0)
})

test('deveTerAsMesmasAbasNosDoisModulos', async ({ page }) => {
  for (const modulo of ['TENS', 'FES']) {
    await page.goto(`/${modulo.toLowerCase()}`)
    const secoes = page.getByRole('navigation', { name: `Seções de ${modulo}` })

    for (const aba of ['Aparelho', 'Eletrodos', 'Parâmetros', 'Segurança', 'Casos', 'Visão geral']) {
      await secoes.getByRole('link', { name: aba }).click()
      await expect(page.getByRole('heading', { name: aba, level: 2 })).toBeVisible()
      await expect(page).toHaveTitle(`${modulo} · ${aba} · Fisiotech`)
    }
  }
})

test('deveAbrirAMontagemDoAtlasPelaVisaoGeral', async ({ page }) => {
  await page.goto('/tens')

  await page.getByRole('link', { name: 'Joelho' }).click()

  await expect(page).toHaveURL('/tens/eletrodos?regiao=joelho')
  await expect(page.getByRole('heading', { name: 'Joelho', level: 3 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Joelho' })).toHaveAttribute('aria-pressed', 'true')
})

test('deveFiltrarAsRegioesDoAtlasPorModalidade', async ({ page }) => {
  await page.goto('/fes/eletrodos')

  await page.getByRole('button', { name: 'Quadríceps' }).click()
  await expect(page.getByRole('heading', { name: 'Quadríceps', level: 3 })).toBeVisible()

  await page.getByRole('button', { name: 'TENS', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Quadríceps' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Região lombar' })).toBeVisible()
})

test('deveLevarOsParametrosDoModuloParaOSimulador', async ({ page }) => {
  await page.goto('/fes/parametros')

  await page.getByRole('link', { name: 'Testar no simulador' }).click()

  await expect(page.getByRole('heading', { name: 'Simulador' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'FES', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('combobox', { name: 'Modo' })).toHaveValue('FES síncrono')
  await expect(page.getByRole('textbox', { name: 'Rampa de subida' })).toHaveValue('2')
})

test('deveRedesenharOPulsoACadaAjusteNoSimulador', async ({ page }) => {
  await page.goto('/simulador')
  const descricao = page.getByTestId('descricao-pulso')
  await expect(page.getByRole('textbox', { name: 'Intensidade do canal 1' })).toHaveValue('0')

  await page.getByRole('textbox', { name: 'Frequência' }).fill('90')

  await expect(descricao).toContainText('90 pulsos por segundo')
})

test('deveTravarOValorNoLimiteDoAparelho', async ({ page }) => {
  await page.goto('/simulador')
  const largura = page.getByRole('textbox', { name: 'Largura de pulso' })

  await largura.fill('500')
  await largura.blur()

  await expect(largura).toHaveValue('150')
  await expect(page.getByText(/Valor ajustado para 150 µs, o limite do aparelho/)).toBeVisible()
})
