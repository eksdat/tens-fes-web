import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { ErroDeCampo } from './ErroDeCampo'

export type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string
  dica?: string
  erro?: string
  /** Botão ou texto fixo colado ao lado do campo, dentro da borda. */
  complemento?: ReactNode
  ref?: Ref<HTMLInputElement>
}

/** Campo com rótulo visível, dica e erro ligados por aria-describedby. O erro nunca depende só de cor. */
export function Campo({ rotulo, dica, erro, complemento, id, ref, ...input }: CampoProps) {
  const gerado = useId()
  const idCampo = id ?? gerado
  const idDica = dica ? `${idCampo}-dica` : undefined
  const idErro = erro ? `${idCampo}-erro` : undefined
  const descrito = [idDica, idErro].filter(Boolean).join(' ') || undefined

  return (
    <div className={`tf-field${erro ? ' tf-field--erro' : ''}`}>
      <label className="tf-field__label" htmlFor={idCampo}>
        {rotulo}
      </label>
      <div className="tf-control">
        <input
          id={idCampo}
          ref={ref}
          className="tf-input"
          aria-invalid={erro ? true : undefined}
          aria-describedby={descrito}
          {...input}
        />
        {complemento}
      </div>
      {dica && (
        <p id={idDica} className="tf-field__hint">
          {dica}
        </p>
      )}
      {erro && <ErroDeCampo id={idErro}>{erro}</ErroDeCampo>}
    </div>
  )
}
