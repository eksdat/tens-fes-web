import { expect, test as base } from '@playwright/test'
import { ApiFalsa } from './apiFalsa'
import { CODIGO_AUTENTICADOR, GANCHO, PETER_PAN, SININHO, WENDY, type Conta } from './dados'
import { SupabaseFalso } from './supabaseFalso'

type Apoio = {
  primeiroAcesso: boolean
  supabase: SupabaseFalso
  api: ApiFalsa
  /** Entra pela tela de login, como a pessoa faria. Conta com autenticador também digita o código. */
  entrarComo: (conta: Conta) => Promise<void>
}

/**
 * `test` dos testes ponta a ponta. Todo teste já começa com o Supabase e a API falsos ligados (auto) e termina
 * conferindo que nenhuma chamada ficou sem resposta e que a tela não teve erro de JavaScript.
 */
export const test = base.extend<Apoio>({
  primeiroAcesso: [false, { option: true }],
  supabase: [
    async ({ page }, use) => {
      const supabase = new SupabaseFalso()
      await supabase.ligar(page)
      await use(supabase)
      expect(supabase.naoAtendidas, 'chamadas ao Supabase sem resposta no teste').toEqual([])
    },
    { auto: true },
  ],

  api: [
    async ({ page, supabase, primeiroAcesso }, use) => {
      if (!primeiroAcesso) {
        await page.addInitScript((ids) => {
          for (const id of ids) localStorage.setItem(`fisiotech:tutorial-conteudo:${id}`, 'visto')
        }, [SININHO.id, GANCHO.id, PETER_PAN.id, WENDY.id])
      }
      const api = new ApiFalsa(supabase)
      await api.ligar(page)
      const errosNaTela: string[] = []
      page.on('pageerror', (erro) => errosNaTela.push(erro.message))
      await use(api)
      expect(api.naoAtendidas, 'chamadas à API sem resposta no teste').toEqual([])
      expect(errosNaTela, 'erros de JavaScript na tela').toEqual([])
    },
    { auto: true },
  ],

  entrarComo: async ({ page, supabase }, use) => {
    await use(async (conta) => {
      if (!supabase.conta(conta.id)) supabase.adicionar(conta)
      await page.goto('/login')
      await page.getByLabel('E-mail').fill(conta.email)
      await page.getByLabel('Senha', { exact: true }).fill(conta.senha)
      await page.getByRole('button', { name: 'Entrar', exact: true }).click()
      if (conta.autenticador) {
        await page.getByLabel('Dígito 1 de 6').fill(CODIGO_AUTENTICADOR)
        await page.getByRole('button', { name: 'Verificar' }).click()
      }
      const titulo = conta.perfil === 'PROFISSIONAL' ? 'TENS e FES na prática clínica' : 'Aprenda TENS e FES'
      await expect(page.getByRole('heading', { name: titulo })).toBeVisible()
    })
  },
})

export { expect }
