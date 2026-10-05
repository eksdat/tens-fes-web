/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      VITE_API_URL: 'http://localhost:8080',
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'chave-de-teste',
      // Vazia de propósito: o .env de quem desenvolve pode ter a chave real e ligar o CAPTCHA em todos os testes.
      VITE_TURNSTILE_SITE_KEY: '',
    },
  },
})
