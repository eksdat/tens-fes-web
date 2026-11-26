/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  /** Site Key do Cloudflare Turnstile. Vazia: CAPTCHA desligado. */
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Fontes auto-hospedadas (@fontsource): importadas só pelo efeito colateral (CSS), sem tipos. */
declare module '@fontsource/*'
