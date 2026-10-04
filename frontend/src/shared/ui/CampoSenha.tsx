import { useState } from 'react'
import { Campo, type CampoProps } from './Campo'
import { IconeOlho } from './Icones'

/** Campo de senha com botão "Mostrar/Ocultar". O botão usa aria-pressed para anunciar o estado. */
export function CampoSenha(props: Omit<CampoProps, 'type' | 'complemento'>) {
  const [visivel, setVisivel] = useState(false)

  return (
    <Campo
      {...props}
      type={visivel ? 'text' : 'password'}
      autoCapitalize="none"
      spellCheck={false}
      complemento={
        <button
          type="button"
          className="tf-control__extra"
          aria-pressed={visivel}
          aria-label="Mostrar senha"
          onClick={() => setVisivel((atual) => !atual)}
        >
          <IconeOlho />
          <span aria-hidden="true">{visivel ? 'Ocultar' : 'Mostrar'}</span>
        </button>
      }
    />
  )
}
