import { useId, type Ref, type TextareaHTMLAttributes } from 'react'
import { ErroDeCampo } from './ErroDeCampo'

export type CampoTextoLongoProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  rotulo: string
  dica?: string
  erro?: string
  ref?: Ref<HTMLTextAreaElement>
}

/** Mesmo contrato do Campo, para texto de várias linhas. */
export function CampoTextoLongo({ rotulo, dica, erro, id, ref, rows = 3, ...textarea }: CampoTextoLongoProps) {
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
      <textarea
        id={idCampo}
        ref={ref}
        rows={rows}
        className="tf-input tf-textarea"
        aria-invalid={erro ? true : undefined}
        aria-describedby={descrito}
        {...textarea}
      />
      {dica && (
        <p id={idDica} className="tf-field__hint">
          {dica}
        </p>
      )}
      {erro && <ErroDeCampo id={idErro}>{erro}</ErroDeCampo>}
    </div>
  )
}
