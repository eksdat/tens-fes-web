import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm, type UseFormRegister } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'
import { AvisoDadosFicticios } from '../pacientes/AvisoDadosFicticios'
import {
  atualizarAvaliacao,
  buscarAvaliacao,
  chaveAvaliacoes,
  criarAvaliacao,
  ITENS_TRIAGEM,
  ROTULO_ESTADO,
  ROTULO_LADO,
  type Avaliacao,
  type AvaliacaoRequest,
  type BlocoAchado,
  type EstadoAchado,
  type ItemTriagem,
} from './api'

const ESTADOS: EstadoAchado[] = ['NAO_AVALIADO', 'AUSENTE', 'PRESENTE']
const hoje = () => new Date().toISOString().slice(0, 10)
const texto = (max: number) => z.string().max(max, `Use até ${max} caracteres.`)

const schema = z.object({
  dataAvaliacao: z
    .string()
    .min(1, 'Informe a data da avaliação.')
    .refine((v) => v <= hoje(), 'A data não pode estar no futuro.'),
  queixa: texto(2000),
  historico: texto(2000),
  /** Texto no formulário: vazio quer dizer "não avaliada" e vira null, nunca zero. */
  dorEscala: z.string().refine((v) => v === '' || /^(10|[0-9])$/.test(v), 'Use a escala de 0 a 10.'),
  dorContexto: texto(500),
  dorTarefa: texto(500),
  dorMomento: texto(500),
  objetivo: texto(2000),
  plano: texto(2000),
  triagem: z.record(z.string(), z.enum(ESTADOS)),
  achados: z.array(
    z.object({
      bloco: z.enum(['PELE_SENSIBILIDADE', 'FUNCAO_MOTORA']),
      descricao: z.string().trim().min(1, 'Descreva o achado.').max(200),
      estado: z.enum(ESTADOS),
      lado: z.string().min(1, 'Informe o lado.'),
      regiao: z.string().trim().min(1, 'Informe a região.').max(100),
      metodo: z.string().trim().min(1, 'Informe o método.').max(100),
    }),
  ),
})

type Valores = z.infer<typeof schema>

const triagemInicial = () =>
  Object.fromEntries(ITENS_TRIAGEM.map(({ item }) => [item, 'NAO_AVALIADO'])) as Record<ItemTriagem, EstadoAchado>

const VAZIO: Valores = {
  dataAvaliacao: '',
  queixa: '',
  historico: '',
  dorEscala: '',
  dorContexto: '',
  dorTarefa: '',
  dorMomento: '',
  objetivo: '',
  plano: '',
  triagem: triagemInicial(),
  achados: [],
}

const nulo = (v: string) => (v.trim() ? v.trim() : null)

function paraRequest(v: Valores): AvaliacaoRequest {
  return {
    dataAvaliacao: v.dataAvaliacao,
    queixa: nulo(v.queixa),
    historico: nulo(v.historico),
    dorEscala: v.dorEscala === '' ? null : Number(v.dorEscala),
    dorContexto: nulo(v.dorContexto),
    dorTarefa: nulo(v.dorTarefa),
    dorMomento: nulo(v.dorMomento),
    objetivo: nulo(v.objetivo),
    plano: nulo(v.plano),
    triagem: { ...triagemInicial(), ...v.triagem } as Record<ItemTriagem, EstadoAchado>,
    achados: v.achados.map((a) => ({ ...a, lado: a.lado as AvaliacaoRequest['achados'][number]['lado'] })),
  }
}

function paraValores(a: Avaliacao): Valores {
  const s = (x: string | null) => x ?? ''
  return {
    dataAvaliacao: a.dataAvaliacao,
    queixa: s(a.queixa),
    historico: s(a.historico),
    dorEscala: a.dorEscala === null ? '' : String(a.dorEscala),
    dorContexto: s(a.dorContexto),
    dorTarefa: s(a.dorTarefa),
    dorMomento: s(a.dorMomento),
    objetivo: s(a.objetivo),
    plano: s(a.plano),
    triagem: { ...triagemInicial(), ...a.triagem },
    achados: a.achados,
  }
}

const BLOCOS: { bloco: BlocoAchado; titulo: string; adicionar: string; dica: string }[] = [
  {
    bloco: 'PELE_SENSIBILIDADE',
    titulo: 'Pele e sensibilidade',
    adicionar: 'Adicionar achado de pele e sensibilidade',
    dica: 'Integridade, reação a adesivos, percepção sensorial e capacidade de comunicar desconforto.',
  },
  {
    bloco: 'FUNCAO_MOTORA',
    titulo: 'Função motora',
    adicionar: 'Adicionar achado de função motora',
    dica: 'Movimento ativo, amplitude, força por método identificado, resposta ao estímulo e fadiga.',
  },
]

export function AvaliacaoFormPage() {
  const { id: pacienteId = '', avaliacaoId } = useParams()
  const editando = Boolean(avaliacaoId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  const existente = useQuery({
    queryKey: [...chaveAvaliacoes(pacienteId), avaliacaoId],
    queryFn: () => buscarAvaliacao(pacienteId, avaliacaoId as string),
    enabled: editando,
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: VAZIO })
  const achados = useFieldArray({ control, name: 'achados' })

  useEffect(() => {
    if (existente.data) reset(paraValores(existente.data))
  }, [existente.data, reset])

  if (editando && existente.isPending) return <TelaCarregando />

  async function salvar(valores: Valores) {
    setErroGeral(null)
    try {
      const corpo = paraRequest(valores)
      if (avaliacaoId) await atualizarAvaliacao(pacienteId, avaliacaoId, corpo)
      else await criarAvaliacao(pacienteId, corpo)
      await queryClient.invalidateQueries({ queryKey: chaveAvaliacoes(pacienteId) })
      navigate(`/pacientes/${pacienteId}`)
    } catch {
      setErroGeral('Não foi possível salvar a avaliação. Confira os dados e tente de novo.')
    }
  }

  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <h1 className="tf-titulo">{editando ? 'Editar avaliação' : 'Avaliação inicial'}</h1>
        <p className="tf-sub">
          Use "não avaliado", "ausente" e "presente" como estados diferentes. Campo vazio não quer dizer ausência de risco.
        </p>
      </div>
      <AvisoDadosFicticios />
      {erroGeral && <Alerta intencao="perigo" titulo={erroGeral} />}

      <form className="tf-pilha" noValidate onSubmit={handleSubmit(salvar)}>
        <Campo
          rotulo="Data da avaliação"
          type="date"
          max={hoje()}
          erro={errors.dataAvaliacao?.message}
          {...register('dataAvaliacao')}
        />

        <Bloco titulo="Queixa">
          <CampoTextoLongo
            rotulo="Queixa"
            dica="Local, início, evolução, fatores de piora e alívio, impacto nas atividades."
            erro={errors.queixa?.message}
            {...register('queixa')}
          />
        </Bloco>

        <Bloco titulo="Histórico">
          <CampoTextoLongo
            rotulo="Histórico"
            dica="Condições relevantes, cirurgias, implantes, medicações pertinentes e tratamentos anteriores."
            erro={errors.historico?.message}
            {...register('historico')}
          />
        </Bloco>

        <Bloco titulo="Triagem">
          {ITENS_TRIAGEM.map(({ item, rotulo }) => (
            <GrupoEstado key={item} legenda={rotulo} nome={`triagem.${item}`} register={register} />
          ))}
        </Bloco>

        <Bloco titulo="Dor">
          <div className="tf-form-grade">
            <Campo
              rotulo="Dor de 0 a 10"
              dica="0 = sem dor; 10 = pior dor imaginável. Deixe vazio se não avaliou."
              inputMode="numeric"
              erro={errors.dorEscala?.message}
              {...register('dorEscala')}
            />
            <Campo rotulo="Contexto" erro={errors.dorContexto?.message} {...register('dorContexto')} />
            <Campo rotulo="Tarefa" erro={errors.dorTarefa?.message} {...register('dorTarefa')} />
            <Campo rotulo="Momento" erro={errors.dorMomento?.message} {...register('dorMomento')} />
          </div>
        </Bloco>

        {BLOCOS.map(({ bloco, titulo, adicionar, dica }) => (
          <Bloco key={bloco} titulo={titulo}>
            <p className="tf-sub">{dica} Cada achado leva lado, região e método.</p>
            {achados.fields.map((campo, i) =>
              campo.bloco !== bloco ? null : (
                <fieldset key={campo.id} className="tf-checklist">
                  <legend className="tf-checklist__etapa">Achado {i + 1}</legend>
                  <Campo
                    rotulo="Descrição"
                    erro={errors.achados?.[i]?.descricao?.message}
                    {...register(`achados.${i}.descricao`)}
                  />
                  <GrupoEstado legenda="Estado" nome={`achados.${i}.estado`} register={register} />
                  <div className="tf-form-grade">
                    <CampoSelecao
                      rotulo="Lado"
                      opcoes={Object.entries(ROTULO_LADO).map(([valor, rotulo]) => ({ valor, rotulo }))}
                      erro={errors.achados?.[i]?.lado?.message}
                      {...register(`achados.${i}.lado`)}
                    />
                    <Campo rotulo="Região" erro={errors.achados?.[i]?.regiao?.message} {...register(`achados.${i}.regiao`)} />
                    <Campo
                      rotulo="Método"
                      dica="Como foi avaliado, por exemplo: inspeção, teste manual."
                      erro={errors.achados?.[i]?.metodo?.message}
                      {...register(`achados.${i}.metodo`)}
                    />
                  </div>
                  <Botao variante="ghost" onClick={() => achados.remove(i)}>
                    Remover achado {i + 1}
                  </Botao>
                </fieldset>
              ),
            )}
            <Botao
              variante="secundario"
              onClick={() =>
                achados.append({ bloco, descricao: '', estado: 'NAO_AVALIADO', lado: '', regiao: '', metodo: '' })
              }
            >
              {adicionar}
            </Botao>
          </Bloco>
        ))}

        <Bloco titulo="Objetivo e plano">
          <CampoTextoLongo
            rotulo="Objetivo mensurável"
            dica="Exemplo: avaliar a mudança da dor na tarefa de levantar de uma cadeira após uma aplicação sensorial."
            erro={errors.objetivo?.message}
            {...register('objetivo')}
          />
          <CampoTextoLongo
            rotulo="Plano"
            dica="Problema priorizado, justificativa, cuidados e medida de reavaliação."
            erro={errors.plano?.message}
            {...register('plano')}
          />
        </Bloco>

        <div className="tf-acoes">
          <Botao type="submit" carregando={isSubmitting}>
            Salvar avaliação
          </Botao>
          <BotaoLink to={`/pacientes/${pacienteId}`}>Cancelar</BotaoLink>
        </div>
      </form>
    </section>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="tf-cartao tf-pilha" aria-label={titulo}>
      <h2 className="tf-cartao__titulo">{titulo}</h2>
      {children}
    </section>
  )
}

function GrupoEstado({
  legenda,
  nome,
  register,
}: {
  legenda: string
  nome: `triagem.${string}` | `achados.${number}.estado`
  register: UseFormRegister<Valores>
}) {
  return (
    <fieldset className="tf-estado">
      <legend className="tf-estado__legenda">{legenda}</legend>
      <div className="tf-estado__opcoes">
        {ESTADOS.map((estado) => (
          <label key={estado} className="tf-check">
            <input type="radio" value={estado} {...register(nome)} />
            {ROTULO_ESTADO[estado]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
