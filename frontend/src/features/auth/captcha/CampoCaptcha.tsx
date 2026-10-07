import { useEffect, useRef, useState } from 'react'

type ApiTurnstile = {
  render: (el: HTMLElement, opcoes: Record<string, unknown>) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: ApiTurnstile
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let carregamento: Promise<void> | null = null

function carregarScript() {
  carregamento ??= new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve()
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      carregamento = null
      reject(new Error('Não foi possível carregar o Turnstile.'))
    }
    document.head.append(script)
  })
  return carregamento
}

export function CampoCaptcha({ chave, aoMudar }: { chave: string; aoMudar: (token: string | null) => void }) {
  const alvo = useRef<HTMLDivElement>(null)
  const [resolvido, setResolvido] = useState(false)

  useEffect(() => {
    let ativo = true
    let id: string | undefined
    carregarScript()
      .then(() => {
        if (!ativo || !alvo.current || !window.turnstile) return
        id = window.turnstile.render(alvo.current, {
          sitekey: chave,
          language: 'pt-br',
          theme: 'light',
          callback: (token: string) => {
            setResolvido(true)
            aoMudar(token)
          },
          'expired-callback': () => {
            setResolvido(false)
            aoMudar(null)
          },
          'error-callback': () => {
            setResolvido(false)
            aoMudar(null)
          },
        })
      })
      .catch(() => aoMudar(null))
    return () => {
      ativo = false
      if (id) window.turnstile?.remove(id)
    }
  }, [chave, aoMudar])

  return (
    <fieldset className="tf-captcha">
      <legend className="tf-sr-only">Verificação de segurança</legend>
      <div ref={alvo} className="tf-captcha__widget" />
      <output className="tf-sr-only">
        {resolvido ? 'Verificação de segurança concluída.' : ''}
      </output>
    </fieldset>
  )
}
