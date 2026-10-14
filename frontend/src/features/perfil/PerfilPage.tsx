import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  CATEGORIAS,
  exemploDeRegistro,
  FORMATO_REGISTRO,
  MENSAGEM_TEXTO,
  normalizarRegistro,
  TEXTO_SEGURO,
  UFS,
} from '../auth/cadastro/cadastro'
import {
  atualizarPerfilProfissional,
  lerErroAtualizacaoPerfil,
} from '../usuario/atualizarPerfil'
import { CHAVE_USUARIO_ATUAL, useUsuarioAtual } from '../usuario/useUsuarioAtual'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'

const schemaPerfilProfissional = z
  .object({
    categoria: z.enum(['FISIOTERAPEUTA', 'TERAPEUTA_OCUPACIONAL', 'OUTRA'], {
      error: 'Escolha sua categoria profissional',
    }),
    registro: z
      .string()
      .trim()
      .min(1, 'Informe o número do registro')
      .max(20, 'Use no máximo 20 caracteres')
      .regex(TEXTO_SEGURO, MENSAGEM_TEXTO),
    uf: z.string().refine((val) => UFS.includes(val as (typeof UFS)[number]), {
      message: 'Escolha a UF do registro',
    }),
  })
  .superRefine((val, ctx) => {
    const registro = normalizarRegistro(val.categoria, val.registro)
    const regra = FORMATO_REGISTRO[val.categoria as keyof typeof FORMATO_REGISTRO]
    if (regra && !regra.formato.test(registro)) {
      ctx.addIssue({
        code: 'custom',
        path: ['registro'],
        message: `Use o formato ${regra.exemplo}`,
      })
    }
  })

type FormPerfilProfissional = z.infer<typeof schemaPerfilProfissional>

const ROTULO_CATEGORIA: Record<string, string> = {
  FISIOTERAPEUTA: 'Fisioterapeuta',
  TERAPEUTA_OCUPACIONAL: 'Terapeuta ocupacional',
  OUTRA: 'Outra',
}

export function PerfilPage() {
  const queryClient = useQueryClient()
  const { data: usuario, isPending } = useUsuarioAtual()
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const form = useForm<FormPerfilProfissional>({
    resolver: zodResolver(schemaPerfilProfissional),
    defaultValues: {
      categoria: 'FISIOTERAPEUTA',
      registro: '',
      uf: '',
    },
  })

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const categoriaEscolhida = useWatch({ control, name: 'categoria' })

  if (isPending || !usuario) return <TelaCarregando />

  const ehEstudante = usuario.perfil === 'ESTUDANTE'
  const ehProfissional = usuario.perfil === 'PROFISSIONAL'

  async function aoSalvarProfissional(valores: FormPerfilProfissional) {
    setErroGeral(null)
    setSucesso(false)
    try {
      const registroNormalizado = normalizarRegistro(valores.categoria, valores.registro)
      const atualizado = await atualizarPerfilProfissional({
        categoria: valores.categoria,
        registro: registroNormalizado,
        uf: valores.uf as (typeof UFS)[number],
      })
      queryClient.setQueryData(CHAVE_USUARIO_ATUAL, atualizado)
      await queryClient.invalidateQueries({ queryKey: CHAVE_USUARIO_ATUAL })
      setSucesso(true)
    } catch (erro) {
      const lido = lerErroAtualizacaoPerfil(erro)
      setErroGeral(lido.mensagem)
      for (const [campo, mensagem] of Object.entries(lido.campos)) {
        if (campo === 'categoria' || campo === 'registro' || campo === 'uf') {
          setError(campo, { message: mensagem })
        }
      }
    }
  }

  const exemplo = exemploDeRegistro(categoriaEscolhida)

  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <h1 className="tf-titulo">Meu perfil</h1>
        <p className="tf-sub">Consulte e gerencie as informações da sua conta.</p>
      </div>

      {sucesso && (
        <Alerta intencao="sucesso" titulo="Perfil atualizado">
          Seu perfil agora é Profissional. Você já tem acesso à área de pacientes.
        </Alerta>
      )}

      {erroGeral && (
        <Alerta intencao="perigo" titulo="Não foi possível atualizar seu perfil">
          {erroGeral}
        </Alerta>
      )}

      <section className="tf-cartao" aria-labelledby="secao-dados-atuais">
        <h2 id="secao-dados-atuais" className="tf-cartao__titulo">
          Dados cadastrais
        </h2>
        <dl className="tf-dados-perfil">
          <div className="tf-dado">
            <dt className="tf-dado__rotulo">Nome completo:</dt>
            <dd className="tf-dado__valor">{usuario.nome}</dd>
          </div>
          <div className="tf-dado">
            <dt className="tf-dado__rotulo">Perfil atual:</dt>
            <dd className="tf-dado__valor">
              {ehProfissional ? 'Profissional' : 'Estudante'}
            </dd>
          </div>
          {usuario.instituicao && (
            <div className="tf-dado">
              <dt className="tf-dado__rotulo">
                {ehProfissional ? 'Formação acadêmica:' : 'Instituição de ensino:'}
              </dt>
              <dd className="tf-dado__valor">
                {usuario.instituicao}
                {usuario.periodo ? ` (${usuario.periodo}º período)` : ''}
              </dd>
            </div>
          )}
          {ehProfissional && usuario.categoria && (
            <div className="tf-dado">
              <dt className="tf-dado__rotulo">Categoria profissional:</dt>
              <dd className="tf-dado__valor">{ROTULO_CATEGORIA[usuario.categoria] ?? usuario.categoria}</dd>
            </div>
          )}
          {ehProfissional && usuario.registro && (
            <div className="tf-dado">
              <dt className="tf-dado__rotulo">Número de registro:</dt>
              <dd className="tf-dado__valor">
                {usuario.registro}
                {usuario.uf ? ` / ${usuario.uf}` : ''}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {ehEstudante && (
        <section className="tf-cartao" aria-labelledby="secao-troca-perfil">
          <h2 id="secao-troca-perfil" className="tf-cartao__titulo">
            Transição para perfil profissional
          </h2>

          <Alerta intencao="info" titulo="Formação concluída?">
            Após a formação, atualize seu perfil e informe seu registro profissional.
          </Alerta>

          <form
            className="tf-pilha"
            style={{ marginTop: 'var(--space-4)' }}
            noValidate
            onSubmit={handleSubmit(aoSalvarProfissional)}
          >
            <CampoSelecao
              rotulo="Categoria profissional"
              dica="Conselho regional correspondente à sua formação"
              opcoes={CATEGORIAS.map((c) => ({ valor: c.valor, rotulo: c.rotulo }))}
              erro={errors.categoria?.message}
              {...register('categoria')}
            />

            <Campo
              rotulo="Número do registro"
              placeholder={exemplo ? `Ex.: ${exemplo}` : 'Número do conselho'}
              dica={exemplo ? `Use o formato ${exemplo}` : 'Número completo do registro'}
              erro={errors.registro?.message}
              {...register('registro')}
            />

            <CampoSelecao
              rotulo="UF do registro"
              placeholder="Selecione a UF"
              opcoes={UFS.map((uf) => ({ valor: uf, rotulo: uf }))}
              erro={errors.uf?.message}
              {...register('uf')}
            />

            <div>
              <Botao type="submit" carregando={isSubmitting}>
                Salvar registro profissional
              </Botao>
            </div>
          </form>
        </section>
      )}
    </section>
  )
}
