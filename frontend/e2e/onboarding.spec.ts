import { expect, test } from './apoio/fixtures'
import { GANCHO, SININHO, type Conta } from './apoio/dados'
import { URL_API } from './apoio/enderecos'

// O tutorial explica o caminho de criação sem criar ou alterar conteúdo.
const CONTAS: Conta[] = [SININHO, GANCHO]
test.use({ primeiroAcesso: true })

for (const conta of CONTAS) {
  test(`deveGuiar${conta.perfil === 'ESTUDANTE' ? 'Estudante' : 'Profissional'}AteOTituloSemMutações`, async ({ page, entrarComo }) => {
    const mutacoes: string[] = []
    page.on('request', (request) => {
      if (request.url().startsWith(URL_API) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) {
        mutacoes.push(`${request.method()} ${new URL(request.url()).pathname}`)
      }
    })

    await entrarComo(conta)

    await expect(page.getByText('Crie seu conteúdo')).toBeVisible()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Próximo' }).click()
    await expect(page).toHaveURL('/criar-conteudo')

    await page.getByRole('dialog').getByRole('button', { name: 'Próximo' }).click()
    await expect(page).toHaveURL('/criar-conteudo/novo')

    await page.getByRole('dialog').getByRole('button', { name: 'Próximo' }).click()
    await expect(page).toHaveURL('/criar-conteudo/novo')
    await page.getByRole('dialog').getByRole('button', { name: 'Fechar tutorial' }).click()
    await expect(page.getByRole('dialog', { name: 'Quer mesmo pular o tutorial?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar tutorial' })).toBeFocused()
    await page.getByRole('button', { name: 'Continuar tutorial' }).click()
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Entendi' })).toBeFocused()
    await page.getByRole('dialog').getByRole('button', { name: 'Fechar tutorial' }).click()
    await page.getByRole('button', { name: 'Pular tutorial' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL('/criar-conteudo/novo')
    await page.goBack()
    await page.goBack()
    await expect(page).toHaveURL('/')

    await page.reload()
    await expect(page.getByRole('link', { name: 'Criar material' })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect(mutacoes).toEqual([])
  })
}

test('deve concluir o tutorial e manter o início livre nas próximas visitas', async ({ page, entrarComo }) => {
  await entrarComo(SININHO)
  for (let passo = 0; passo < 3; passo++) {
    await page.getByRole('dialog').getByRole('button', { name: 'Próximo' }).click()
  }
  await page.getByRole('button', { name: 'Entendi' }).click()
  await expect(page.getByLabel('Título')).toBeFocused()
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Criar material' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
