import { defineConfig, devices } from '@playwright/test'
import { URL_API, URL_SUPABASE } from './e2e/apoio/enderecos'

const PORTA = 4180

/**
 * Testes ponta a ponta (e2e/). Rodam no build de produção, sem backend, sem Supabase e sem .env: o build aponta para
 * endereços que não existem e cada teste responde essas chamadas (e2e/apoio). Só dados fictícios.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'] } },
    // Definição de pronto: tem que funcionar numa tela de 360 px.
    { name: 'celular', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } } },
  ],
  webServer: {
    command: `npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Variáveis do processo têm prioridade sobre os arquivos .env: o .env de quem roda não entra no teste.
    env: {
      VITE_API_URL: URL_API,
      VITE_SUPABASE_URL: URL_SUPABASE,
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_chave-de-teste',
      VITE_TURNSTILE_SITE_KEY: '',
    },
  },
})
