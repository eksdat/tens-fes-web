import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router'
import { ErroDeCampo } from '../../shared/ui/ErroDeCampo'

/** Aceite dos termos (a API exige e grava a versão aceita). Abre os textos em outra aba para não perder o formulário. */
export function CampoAceiteTermos() {
  const {
    register,
    formState: { errors },
  } = useFormContext<{ termos: boolean }>()

  return (
    <div className="tf-pilha">
      <label className="tf-check">
        <input type="checkbox" aria-describedby={errors.termos ? 'termos-erro' : undefined} {...register('termos')} />
        <span>
          Li e aceito os{' '}
          <Link className="tf-link" to="/termos" target="_blank" rel="noopener noreferrer">
            Termos de uso
          </Link>{' '}
          e a{' '}
          <Link className="tf-link" to="/privacidade" target="_blank" rel="noopener noreferrer">
            Política de privacidade
          </Link>
          .
        </span>
      </label>
      {errors.termos && <ErroDeCampo id="termos-erro">{errors.termos.message}</ErroDeCampo>}
    </div>
  )
}
