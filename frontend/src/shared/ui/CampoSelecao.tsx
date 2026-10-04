import { useId, type Ref, type SelectHTMLAttributes } from 'react'
import { ErroDeCampo } from './ErroDeCampo'

export type CampoSelecaoProps = SelectHTMLAttributes<HTMLSelectElement> & {
  rotulo: string
  opcoes: { valor: string; rotulo: string }[]
  /** Texto da opção vazia. */
  placeholder?: string
  dica?: string
  erro?: string
  ref?: Ref<HTMLSelectElement>
}

export function CampoSelecao({ rotulo, opcoes, placeholder = 'Selecione', dica, erro, id, ref, ...select }: CampoSelecaoProps) {
  const gerado = useId()
  const idCampo = id ?? gerado
  const idDica = dica ? `${idCampo}-dica` : undefined
  const idErro = erro ? `${idCampo}-erro` : undefined

  return (
    <div className={`tf-field${erro ? ' tf-field--erro' : ''}`}>
      <label className="tf-field__label" htmlFor={idCampo}>
        {rotulo}
      </label>
      <div className="tf-control">
        <select
          id={idCampo}
          ref={ref}
          className="tf-input tf-select"
          aria-invalid={erro ? true : undefined}
          aria-describedby={[idDica, idErro].filter(Boolean).join(' ') || undefined}
          {...select}
        >
          <option value="">{placeholder}</option>
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
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
