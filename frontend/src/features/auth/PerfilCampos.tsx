import { useFormContext } from 'react-hook-form'
import { Campo } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { ErroDeCampo } from '../../shared/ui/ErroDeCampo'
import {
  CATEGORIAS,
  exemploDeRegistro,
  INSTITUICOES,
  PERIODOS,
  UFS,
  type PerfilValores,
} from './cadastro'

const PERFIS = [
  {
    valor: 'ESTUDANTE',
    titulo: 'Estudante',
    descricao: 'Módulos de TENS e FES, exploração do aparelho, simulador e criação de conteúdo.',
  },
  {
    valor: 'PROFISSIONAL',
    titulo: 'Profissional',
    descricao: 'Tudo do perfil estudante, mais avaliações, sessões e evolução dos seus pacientes.',
  },
] as const

/**
 * Escolha do perfil e dos campos que ele pede. Precisa estar dentro de um FormProvider cujo formulário tenha
 * os campos de PerfilValores (cadastro e completar cadastro usam o mesmo).
 */
export function PerfilCampos() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<PerfilValores>()
  const perfil = watch('perfil')
  const categoria = watch('categoria')
  const exemplo = exemploDeRegistro(categoria)

  return (
    <>
      <fieldset className="tf-grupo" aria-describedby={errors.perfil ? 'perfil-erro' : undefined}>
        <legend className="tf-field__label">Qual é o seu perfil?</legend>
        <div className="tf-opcoes">
          {PERFIS.map((p) => (
            <label key={p.valor} className="tf-opcao">
              <input type="radio" value={p.valor} {...register('perfil')} />
              <span>
                <strong className="tf-opcao__titulo">{p.titulo}</strong>
                <span className="tf-opcao__texto">{p.descricao}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.perfil && <ErroDeCampo id="perfil-erro">{errors.perfil.message}</ErroDeCampo>}
      </fieldset>

      {perfil === 'ESTUDANTE' && (
        <>
          <Campo
            rotulo="Instituição de ensino"
            dica="Escolha da lista ou digite o nome da sua faculdade."
            autoComplete="organization"
            list="instituicoes"
            erro={errors.instituicao?.message}
            {...register('instituicao')}
          />
          <datalist id="instituicoes">
            {INSTITUICOES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </datalist>
          <CampoSelecao
            rotulo="Período"
            opcoes={PERIODOS.map((n) => ({ valor: String(n), rotulo: `${n}º período` }))}
            erro={errors.periodo?.message}
            {...register('periodo')}
          />
        </>
      )}

      {perfil === 'PROFISSIONAL' && (
        <>
          <CampoSelecao
            rotulo="Categoria profissional"
            opcoes={CATEGORIAS.map((c) => ({ valor: c.valor, rotulo: c.rotulo }))}
            erro={errors.categoria?.message}
            {...register('categoria')}
          />
          <Campo
            rotulo="Número do registro"
            dica={exemplo ? `Formato: ${exemplo}. O registro não é conferido no conselho.` : 'O registro não é conferido no conselho.'}
            autoCapitalize="characters"
            erro={errors.registro?.message}
            {...register('registro')}
          />
          <CampoSelecao
            rotulo="UF do registro"
            opcoes={UFS.map((u) => ({ valor: u, rotulo: u }))}
            erro={errors.uf?.message}
            {...register('uf')}
          />
        </>
      )}
    </>
  )
}
