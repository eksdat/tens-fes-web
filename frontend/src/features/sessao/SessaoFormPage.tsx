import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useParams } from 'react-router'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo, type CampoProps } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'
import { ROTULO_LADO, type Lado } from '../avaliacao/api'
import { MONTAGENS, type Lado as LadoDaPrancha } from '../atlas/montagens'
import { AvisoDadosFicticios } from '../pacientes/AvisoDadosFicticios'
import { ChecklistSeguranca } from '../seguranca/ChecklistSeguranca'
import { SEGURANCA } from '../seguranca/conteudoSeguranca'
import { useUsuarioAtual } from '../usuario/useUsuarioAtual'
import { chaveSessoes, listarSessoes, registrarSessao, type Sessao, type SessaoRequest } from './api'

const AVISO_REAPROVEITAR = 'Parâmetros anteriores não substituem a avaliação desta sessão.'

const agoraLocal = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const numero = (mensagem: string, min: number, max: number, minExclusivo = false) =>
  z
    .string()
    .trim()
    .min(1, mensagem)
    .refine((v) => {
      const n = Number(v.replace(',', '.'))
      return Number.isFinite(n) && (minExclusivo ? n > min : n >= min) && n <= max
    }, `Use um valor ${minExclusivo ? 'maior que' : 'a partir de'} ${min} e até ${max}.`)

const opcional = (max: number) => z.string().max(max, `Use até ${max} caracteres.`)
const obrigatorio = (mensagem: string, max: number) => z.string().trim().min(1, mensagem).max(max, `Use até ${max} caracteres.`)

const schema = z.object({
  dataHora: z
    .string()
    .min(1, 'Informe a data e a hora.')
    .refine((v) => v <= agoraLocal(), 'A sessão não pode estar no futuro.'),
  objetivo: obrigatorio('Informe o objetivo desta sessão.', 500),
  modalidade: z.enum(['TENS', 'NMES', 'FES']),
  aparelho: obrigatorio('Informe o aparelho.', 120),
  modo: opcional(60),
  duracaoRealMin: numero('Informe a duração real em minutos.', 0, 240, true),
  canais: z
    .array(
      z.object({
        frequenciaHz: numero('Informe a frequência em Hz.', 0, 1000, true),
        larguraPulsoUs: numero('Informe a largura de pulso em µs.', 1, 1000),
        amplitudeInicialMa: z.string().refine((v) => v.trim() === '' || (Number(v) >= 0 && Number(v) <= 100), 'Use de 0 a 100 mA.'),
        amplitudeFinalMa: numero('Informe a amplitude final em mA.', 0, 100),
        par: obrigatorio('Informe o par de eletrodos.', 20),
      }),
    )
    .min(1)
    .max(2),
  montagemId: z.string(),
  eletrodoTipo: obrigatorio('Informe o tipo de eletrodo.', 80),
  eletrodoDimensoes: obrigatorio('Informe as dimensões do eletrodo.', 40),
  lado: z.string().min(1, 'Informe o lado.'),
  marcos: obrigatorio('Informe os marcos anatômicos.', 300),
  sensacao: opcional(500),
  contracao: opcional(500),
  tolerancia: opcional(500),
  fadiga: opcional(500),
  ajustes: opcional(500),
  medidaAntes: opcional(200),
  medidaDepois: opcional(200),
  medidaContexto: opcional(300),
  condicaoPele: obrigatorio('Informe a condição da pele.', 300),
  motivoTermino: obrigatorio('Informe o motivo do término.', 300),
  planoReavaliacao: obrigatorio('Informe o plano de reavaliação.', 500),
})

type Valores = z.infer<typeof schema>

const CANAL_VAZIO = { frequenciaHz: '', larguraPulsoUs: '', amplitudeInicialMa: '', amplitudeFinalMa: '', par: '' }

const VAZIO: Valores = {
  dataHora: '',
  objetivo: '',
  modalidade: 'TENS',
  aparelho: 'Neurodyn Portable',
  modo: '',
  duracaoRealMin: '',
  canais: [CANAL_VAZIO],
  montagemId: '',
  eletrodoTipo: '',
  eletrodoDimensoes: '',
  lado: '',
  marcos: '',
  sensacao: '',
  contracao: '',
  tolerancia: '',
  fadiga: '',
  ajustes: '',
  medidaAntes: '',
  medidaDepois: '',
  medidaContexto: '',
  condicaoPele: '',
  motivoTermino: '',
  planoReavaliacao: '',
}

const LADO_DA_PRANCHA: Record<LadoDaPrancha, Lado> = {
  esquerdo: 'ESQUERDO',
  direito: 'DIREITO',
  bilateral: 'BILATERAL',
  central: 'NAO_SE_APLICA',
}

const num = (v: string) => Number(v.replace(',', '.'))
const nulo = (v: string) => (v.trim() ? v.trim() : null)

function paraRequest(v: Valores, checklist: Set<string>): SessaoRequest {
  return {
    dataHora: new Date(v.dataHora).toISOString(),
    objetivo: v.objetivo.trim(),
    modalidade: v.modalidade,
    aparelho: v.aparelho.trim(),
    modo: nulo(v.modo),
    duracaoRealMin: num(v.duracaoRealMin),
    canais: v.canais.map((c, i) => ({
      canal: (i + 1) as 1 | 2,
      frequenciaHz: num(c.frequenciaHz),
      larguraPulsoUs: num(c.larguraPulsoUs),
      amplitudeInicialMa: c.amplitudeInicialMa.trim() ? num(c.amplitudeInicialMa) : null,
      amplitudeFinalMa: num(c.amplitudeFinalMa),
      par: c.par.trim(),
    })),
    eletrodoTipo: v.eletrodoTipo.trim(),
    eletrodoDimensoes: v.eletrodoDimensoes.trim(),
    lado: v.lado as Lado,
    marcos: v.marcos.trim(),
    montagemId: nulo(v.montagemId),
    sensacao: nulo(v.sensacao),
    contracao: nulo(v.contracao),
    tolerancia: nulo(v.tolerancia),
    fadiga: nulo(v.fadiga),
    ajustes: nulo(v.ajustes),
    medidaAntes: nulo(v.medidaAntes),
    medidaDepois: nulo(v.medidaDepois),
    medidaContexto: nulo(v.medidaContexto),
    condicaoPele: v.condicaoPele.trim(),
    motivoTermino: v.motivoTermino.trim(),
    planoReavaliacao: v.planoReavaliacao.trim(),
    checklist: [...checklist],
  }
}

/** Só aplicação e eletrodos voltam: data, resposta, resultado e encerramento são desta sessão. */
function reaproveitar(s: Sessao): Partial<Valores> {
  return {
    modalidade: s.modalidade,
    aparelho: s.aparelho,
    modo: s.modo ?? '',
    canais: s.canais.map((c) => ({
      frequenciaHz: String(c.frequenciaHz),
      larguraPulsoUs: String(c.larguraPulsoUs),
      amplitudeInicialMa: c.amplitudeInicialMa === null ? '' : String(c.amplitudeInicialMa),
      amplitudeFinalMa: String(c.amplitudeFinalMa),
      par: c.par,
    })),
    montagemId: s.montagemId ?? '',
    eletrodoTipo: s.eletrodoTipo,
    eletrodoDimensoes: s.eletrodoDimensoes,
    lado: s.lado,
    marcos: s.marcos,
  }
}

const ROTULO_MODALIDADE = { TENS: 'TENS', NMES: 'NMES', FES: 'FES' } as const

export function SessaoFormPage() {
  const { id: pacienteId = '' } = useParams()
  const queryClient = useQueryClient()
  const usuario = useUsuarioAtual()
  const [etapa, setEtapa] = useState<'preencher' | 'revisar' | 'salva'>('preencher')
  const [reaproveitado, setReaproveitado] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [checklist, setChecklist] = useState<Set<string>>(new Set())

  const anteriores = useQuery({ queryKey: chaveSessoes(pacienteId), queryFn: () => listarSessoes(pacienteId) })
  const ultima = anteriores.data?.[0]

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: VAZIO })
  const canais = useFieldArray({ control, name: 'canais' })
  const modalidade = useWatch({ control, name: 'modalidade' })
  const montagemId = useWatch({ control, name: 'montagemId' })

  function aoEscolherPrancha(id: string) {
    setValue('montagemId', id)
    const prancha = MONTAGENS.find((m) => m.id === id)
    if (!prancha) return
    setValue('lado', LADO_DA_PRANCHA[prancha.lado])
    setValue('eletrodoTipo', prancha.caracteristicasEletrodos.tipo)
    setValue(
      'eletrodoDimensoes',
      `${prancha.caracteristicasEletrodos.larguraCm} cm × ${prancha.caracteristicasEletrodos.alturaCm} cm`,
    )
    setValue('marcos', prancha.marcos)
  }

  function alternarItem(chave: string) {
    setChecklist((atuais) => {
      const novos = new Set(atuais)
      if (novos.has(chave)) novos.delete(chave)
      else novos.add(chave)
      return novos
    })
  }

  async function salvar() {
    setErroGeral(null)
    setSalvando(true)
    try {
      await registrarSessao(pacienteId, paraRequest(getValues(), checklist))
      await queryClient.invalidateQueries({ queryKey: chaveSessoes(pacienteId) })
      setEtapa('salva')
    } catch {
      setErroGeral('Não foi possível salvar a sessão. Volte, confira os dados e tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  const pranchas = MONTAGENS.filter((m) => (modalidade === 'TENS' ? m.modalidade === 'TENS' : m.modalidade === 'FES'))
  const unidade = (texto: string) => <span className="tf-control__unidade" aria-hidden="true">{texto}</span>

  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <h1 className="tf-titulo">Registrar sessão</h1>
        <p className="tf-sub">Documente os parâmetros efetivos, os eletrodos, a resposta e a duração real.</p>
      </div>
      <AvisoDadosFicticios />

      <output className="tf-sessao__confirmacao">
        {etapa === 'salva' && (
          <div className="tf-alert tf-alert--sucesso">
            <p className="tf-alert__titulo">Sessão registrada.</p>
            <p className="tf-alert__texto">Ela já aparece no histórico do paciente.</p>
          </div>
        )}
      </output>
      {etapa === 'salva' && <BotaoLink to={`/pacientes/${pacienteId}`}>Voltar ao paciente</BotaoLink>}

      {etapa === 'revisar' && (
        <Revisao
          valores={getValues()}
          checklist={checklist}
          erro={erroGeral}
          salvando={salvando}
          aoVoltar={() => setEtapa('preencher')}
          aoSalvar={() => void salvar()}
        />
      )}

      <form
        className="tf-pilha"
        noValidate
        hidden={etapa !== 'preencher'}
        onSubmit={handleSubmit(() => setEtapa('revisar'))}
      >
        {ultima && (
          <div className="tf-pilha">
            <Botao
              variante="secundario"
              onClick={() => {
                reset({ ...VAZIO, ...reaproveitar(ultima) })
                setReaproveitado(true)
              }}
            >
              Reaproveitar a sessão anterior
            </Botao>
            {reaproveitado && <Alerta intencao="atencao" titulo={AVISO_REAPROVEITAR} />}
          </div>
        )}

        <Bloco titulo="Contexto">
          <div className="tf-form-grade">
            <Campo rotulo="Data e hora" type="datetime-local" max={agoraLocal()} erro={errors.dataHora?.message} {...register('dataHora')} />
            <div className="tf-field">
              <p className="tf-field__label">Profissional</p>
              <p>{usuario.data?.nome}</p>
            </div>
            <CampoSelecao
              rotulo="Modalidade"
              placeholder="Selecione"
              opcoes={Object.entries(ROTULO_MODALIDADE).map(([valor, rotulo]) => ({ valor, rotulo }))}
              {...register('modalidade')}
            />
          </div>
          <CampoTextoLongo rotulo="Objetivo desta sessão" erro={errors.objetivo?.message} {...register('objetivo')} />
        </Bloco>

        <Bloco titulo="Aplicação">
          <div className="tf-form-grade">
            <Campo rotulo="Aparelho" dica="Fabricante e modelo." erro={errors.aparelho?.message} {...register('aparelho')} />
            <Campo rotulo="Modo" erro={errors.modo?.message} {...register('modo')} />
            <CampoNumero
              rotulo="Duração real, em minutos"
              complemento={unidade('min')}
              erro={errors.duracaoRealMin?.message}
              {...register('duracaoRealMin')}
            />
          </div>
          {canais.fields.map((campo, i) => (
            <fieldset key={campo.id} className="tf-checklist">
              <legend className="tf-checklist__etapa">Canal {i + 1}</legend>
              <div className="tf-form-grade">
                <CampoNumero
                  rotulo={`Frequência do canal ${i + 1}, em hertz`}
                  complemento={unidade('Hz')}
                  erro={errors.canais?.[i]?.frequenciaHz?.message}
                  {...register(`canais.${i}.frequenciaHz`)}
                />
                <CampoNumero
                  rotulo={`Largura de pulso do canal ${i + 1}, em microssegundos`}
                  dica="Use a convenção de fase/pulso do manual. 1 ms = 1.000 µs."
                  complemento={unidade('µs')}
                  erro={errors.canais?.[i]?.larguraPulsoUs?.message}
                  {...register(`canais.${i}.larguraPulsoUs`)}
                />
                <CampoNumero
                  rotulo={`Amplitude inicial do canal ${i + 1}, em miliampères`}
                  complemento={unidade('mA')}
                  erro={errors.canais?.[i]?.amplitudeInicialMa?.message}
                  {...register(`canais.${i}.amplitudeInicialMa`)}
                />
                <CampoNumero
                  rotulo={`Amplitude final do canal ${i + 1}, em miliampères`}
                  complemento={unidade('mA')}
                  erro={errors.canais?.[i]?.amplitudeFinalMa?.message}
                  {...register(`canais.${i}.amplitudeFinalMa`)}
                />
                <Campo
                  rotulo={`Par de eletrodos do canal ${i + 1}`}
                  dica={`Exemplo: ${i + 1}A-${i + 1}B.`}
                  erro={errors.canais?.[i]?.par?.message}
                  {...register(`canais.${i}.par`)}
                />
              </div>
              {i === 1 && (
                <Botao variante="ghost" onClick={() => canais.remove(1)}>
                  Remover canal 2
                </Botao>
              )}
            </fieldset>
          ))}
          {canais.fields.length < 2 && (
            <Botao variante="secundario" onClick={() => canais.append(CANAL_VAZIO)}>
              Adicionar canal 2
            </Botao>
          )}
        </Bloco>

        <Bloco titulo="Eletrodos">
          <CampoSelecao
            rotulo="Prancha do atlas (opcional)"
            dica="Escolher uma prancha preenche lado, eletrodo e marcos. Ajuste ao paciente."
            placeholder="Nenhuma"
            opcoes={pranchas.map((m) => ({ valor: m.id, rotulo: m.nome }))}
            value={montagemId}
            onChange={(e) => aoEscolherPrancha(e.target.value)}
          />
          <div className="tf-form-grade">
            <Campo rotulo="Tipo de eletrodo" erro={errors.eletrodoTipo?.message} {...register('eletrodoTipo')} />
            <Campo rotulo="Dimensões" erro={errors.eletrodoDimensoes?.message} {...register('eletrodoDimensoes')} />
            <CampoSelecao
              rotulo="Lado"
              opcoes={Object.entries(ROTULO_LADO).map(([valor, rotulo]) => ({ valor, rotulo }))}
              erro={errors.lado?.message}
              {...register('lado')}
            />
          </div>
          <CampoTextoLongo rotulo="Marcos anatômicos" erro={errors.marcos?.message} {...register('marcos')} />
        </Bloco>

        <Bloco titulo="Resposta">
          <div className="tf-form-grade">
            <Campo rotulo="Sensação" erro={errors.sensacao?.message} {...register('sensacao')} />
            <Campo rotulo="Contração" erro={errors.contracao?.message} {...register('contracao')} />
            <Campo rotulo="Tolerância" erro={errors.tolerancia?.message} {...register('tolerancia')} />
            <Campo rotulo="Fadiga" erro={errors.fadiga?.message} {...register('fadiga')} />
          </div>
          <CampoTextoLongo rotulo="Ajustes e motivo" erro={errors.ajustes?.message} {...register('ajustes')} />
        </Bloco>

        <Bloco titulo="Resultado">
          <div className="tf-form-grade">
            <Campo rotulo="Medida antes" dica="Exemplo: dor 6/10 na tarefa definida." erro={errors.medidaAntes?.message} {...register('medidaAntes')} />
            <Campo rotulo="Medida depois" erro={errors.medidaDepois?.message} {...register('medidaDepois')} />
          </div>
          <Campo rotulo="Contexto da medida" erro={errors.medidaContexto?.message} {...register('medidaContexto')} />
        </Bloco>

        <Bloco titulo="Encerramento">
          <div className="tf-form-grade">
            <Campo rotulo="Condição da pele" erro={errors.condicaoPele?.message} {...register('condicaoPele')} />
            <Campo rotulo="Motivo do término" erro={errors.motivoTermino?.message} {...register('motivoTermino')} />
          </div>
          <CampoTextoLongo rotulo="Plano de reavaliação" erro={errors.planoReavaliacao?.message} {...register('planoReavaliacao')} />
          <ChecklistSeguranca etapas={SEGURANCA.checklist} marcados={checklist} aoAlternar={alternarItem} />
        </Bloco>

        <div className="tf-acoes">
          <Botao type="submit">Revisar sessão</Botao>
          <BotaoLink to={`/pacientes/${pacienteId}`}>Cancelar</BotaoLink>
        </div>
      </form>
    </section>
  )
}

function CampoNumero(props: CampoProps) {
  return <Campo inputMode="decimal" autoComplete="off" {...props} />
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="tf-cartao tf-pilha" aria-label={titulo}>
      <h2 className="tf-cartao__titulo">{titulo}</h2>
      {children}
    </section>
  )
}

type RevisaoProps = {
  valores: Valores
  checklist: Set<string>
  erro: string | null
  salvando: boolean
  aoVoltar: () => void
  aoSalvar: () => void
}

function Revisao({ valores: v, checklist, erro, salvando, aoVoltar, aoSalvar }: RevisaoProps) {
  const ou = (x: string) => x.trim() || 'Não informado'
  const linhas: [string, ReactNode][] = [
    ['Data e hora', new Date(v.dataHora).toLocaleString('pt-BR')],
    ['Objetivo', v.objetivo],
    ['Modalidade e aparelho', `${v.modalidade} · ${v.aparelho}${v.modo ? ` · ${v.modo}` : ''}`],
    ['Duração real', `${v.duracaoRealMin} min`],
    [
      'Parâmetros',
      <ul key="canais" className="tf-lista-simples">
        {v.canais.map((c, i) => (
          <li key={i}>
            Canal {i + 1}: <span>{`${c.frequenciaHz} Hz · ${c.larguraPulsoUs} µs · ${c.amplitudeFinalMa} mA (final) · par ${c.par}`}</span>
          </li>
        ))}
      </ul>,
    ],
    ['Eletrodos', `${v.eletrodoTipo}, ${v.eletrodoDimensoes} · ${ROTULO_LADO[v.lado as Lado]} · ${v.marcos}`],
    ['Resposta', `Sensação: ${ou(v.sensacao)} · Contração: ${ou(v.contracao)} · Tolerância: ${ou(v.tolerancia)}`],
    ['Resultado', `Antes: ${ou(v.medidaAntes)} · Depois: ${ou(v.medidaDepois)}`],
    ['Encerramento', `Pele: ${v.condicaoPele} · Término: ${v.motivoTermino} · Reavaliação: ${v.planoReavaliacao}`],
    ['Checklist', `${checklist.size} ${checklist.size === 1 ? 'item marcado' : 'itens marcados'}`],
  ]

  return (
    <section className="tf-cartao tf-pilha" aria-labelledby="titulo-revisao">
      <h2 id="titulo-revisao" className="tf-cartao__titulo">
        Revise antes de salvar
      </h2>
      <dl className="tf-dados">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
      {erro && <Alerta intencao="perigo" titulo={erro} />}
      <div className="tf-acoes">
        <Botao carregando={salvando} onClick={aoSalvar}>
          Salvar sessão
        </Botao>
        <Botao variante="secundario" onClick={aoVoltar}>
          Voltar e corrigir
        </Botao>
      </div>
    </section>
  )
}
