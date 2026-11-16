import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'
import { Dialogo } from '../../shared/ui/Dialogo'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'
import { useToast } from '../../shared/ui/useToast'
import { CorpoMarkdown } from '../modulo/CorpoMarkdown'
import { formatarData } from '../pacientes/formatar'
import { ROTULO_SECAO } from '../revisao/api'
import { AnexosDoMaterial } from './AnexosDoMaterial'
import {
  alterarMaterial,
  AVISOS,
  buscarMaterial,
  CHAVE_MATERIAIS,
  criarMaterial,
  enviarParaRevisao,
  excluirMaterial,
  lerErroMaterial,
  repetirSeNaoFor404,
  rotuloDoEstado,
  type Material,
  type MaterialRequest,
} from './api'

/** Mesmo filtro do backend: recusa o que parece tag ("<p", "</", "<!--"), mas deixa "dor < 5". */
const SEM_HTML = /<[a-zA-Z/!?]/
const semHtml = (v: string) => !SEM_HTML.test(v)

/** Mesmas regras do MaterialRequest do backend; o backend continua sendo quem decide. */
const schema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2, 'Use de 2 a 200 caracteres.')
    .max(200, 'Use de 2 a 200 caracteres.')
    .refine(semHtml, 'Use texto simples, sem HTML.'),
  modalidade: z.string().min(1, 'Escolha a modalidade.'),
  secao: z.string().min(1, 'Escolha o tema.'),
  corpo: z
    .string()
    .trim()
    .min(1, 'Escreva o texto do material.')
    .max(20000, 'Use até 20.000 caracteres.')
    .refine(semHtml, 'Use texto simples ou Markdown, sem HTML.'),
  referencias: z.string().max(2000, 'Use até 2.000 caracteres.').refine(semHtml, 'Use texto simples, sem HTML.'),
})

type Valores = z.infer<typeof schema>

const VAZIO: Valores = { titulo: '', modalidade: '', secao: '', corpo: '', referencias: '' }
const CAMPOS = ['titulo', 'modalidade', 'secao', 'corpo', 'referencias'] as const

const MODALIDADES = [
  { valor: 'TENS', rotulo: 'TENS' },
  { valor: 'NMES', rotulo: 'NMES' },
  { valor: 'FES', rotulo: 'FES' },
]
const TEMAS = Object.entries(ROTULO_SECAO).map(([valor, rotulo]) => ({ valor, rotulo }))

function paraRequest(v: Valores): MaterialRequest {
  const referencias = v.referencias.trim()
  return {
    titulo: v.titulo.trim(),
    modalidade: v.modalidade as MaterialRequest['modalidade'],
    secao: v.secao as MaterialRequest['secao'],
    corpo: v.corpo.trim(),
    referencias: referencias || null,
  }
}

/**
 * Novo material (/criar-conteudo/novo) e rascunho salvo (/criar-conteudo/:id). Os anexos entram depois do primeiro
 * salvamento, porque precisam do material já criado. Enviado para revisão, o material só pode ser lido.
 */
export function MaterialFormPage() {
  const { id: parametro } = useParams()
  const id = parametro ? Number(parametro) : null
  const material = useQuery({
    queryKey: [...CHAVE_MATERIAIS, id],
    queryFn: () => buscarMaterial(id as number),
    enabled: id !== null,
    retry: repetirSeNaoFor404,
  })

  if (id !== null && material.isPending) return <TelaCarregando />
  if (id !== null && material.isError) {
    return (
      <section className="tf-pagina">
        <h1 className="tf-titulo">Material</h1>
        <Alerta intencao="perigo" titulo="Material não encontrado" />
        <BotaoLink to="/criar-conteudo">Voltar para seus materiais</BotaoLink>
      </section>
    )
  }
  if (material.data && material.data.estado !== 'RASCUNHO') return <MaterialEnviado material={material.data} />
  return <FormularioDoMaterial material={material.data} />
}

function FormularioDoMaterial({ material }: { material?: Material }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mostrar } = useToast()
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [confirmarEnvio, setConfirmarEnvio] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: VAZIO })

  useEffect(() => {
    if (material) reset({ ...material, referencias: material.referencias ?? '' })
  }, [material, reset])

  /** Erro de campo vai para o campo; o resto vai no alerta do topo. */
  function mostrarErro(erro: unknown) {
    const lido = lerErroMaterial(erro)
    const semCampo: string[] = []
    for (const [campo, mensagem] of Object.entries(lido.campos)) {
      if ((CAMPOS as readonly string[]).includes(campo)) setError(campo as (typeof CAMPOS)[number], { message: mensagem }, { shouldFocus: true })
      else semCampo.push(mensagem)
    }
    setErroGeral([lido.mensagem, ...semCampo].join(' '))
  }

  async function salvar(valores: Valores) {
    setErroGeral(null)
    try {
      const salvo = material ? await alterarMaterial(material.id, paraRequest(valores)) : await criarMaterial(paraRequest(valores))
      await queryClient.invalidateQueries({ queryKey: CHAVE_MATERIAIS })
      if (material) {
        reset({ ...salvo, referencias: salvo.referencias ?? '' })
        mostrar({ tipo: 'sucesso', titulo: 'Rascunho salvo', texto: 'As alterações foram guardadas.' })
      } else {
        mostrar({ tipo: 'sucesso', titulo: 'Rascunho salvo', texto: 'Agora você pode anexar arquivos.' })
        navigate(`/criar-conteudo/${salvo.id}`, { replace: true })
      }
    } catch (erro) {
      mostrarErro(erro)
    }
  }

  /** Salva o que está na tela antes de enviar: o revisor recebe o texto que a pessoa está vendo. */
  async function enviar(valores: Valores) {
    if (!material) return
    setErroGeral(null)
    setOcupado(true)
    try {
      await alterarMaterial(material.id, paraRequest(valores))
      await enviarParaRevisao(material.id)
      await queryClient.invalidateQueries({ queryKey: CHAVE_MATERIAIS })
      setConfirmarEnvio(false)
      mostrar({ tipo: 'sucesso', titulo: 'Enviado para revisão', texto: 'Você será avisado aqui quando a revisão terminar.' })
    } catch (erro) {
      setConfirmarEnvio(false)
      mostrarErro(erro)
    } finally {
      setOcupado(false)
    }
  }

  async function excluir() {
    if (!material) return
    setOcupado(true)
    try {
      await excluirMaterial(material.id)
      queryClient.removeQueries({ queryKey: [...CHAVE_MATERIAIS, material.id] })
      void queryClient.invalidateQueries({ queryKey: CHAVE_MATERIAIS })
      mostrar({ tipo: 'sucesso', titulo: 'Rascunho excluído', texto: material.titulo })
      navigate('/criar-conteudo')
    } catch (erro) {
      setOcupado(false)
      setConfirmarExclusao(false)
      mostrarErro(erro)
    }
  }

  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <h1 className="tf-titulo">{material ? 'Editar material' : 'Novo material'}</h1>
        <p className="tf-sub">Só você vê o rascunho. Depois de enviado, ele vai para a revisão docente.</p>
      </div>

      <Alerta intencao="atencao" titulo={AVISOS.prontuario} />
      <Alerta intencao="info" titulo={AVISOS.validacao} />

      {material?.motivoDevolucao && (
        <Alerta intencao="atencao" titulo="A revisão devolveu este material">
          {material.motivoDevolucao}
        </Alerta>
      )}
      {erroGeral && (
        <Alerta intencao="perigo" titulo="Não foi possível concluir">
          {erroGeral}
        </Alerta>
      )}

      <form className="tf-cartao tf-pilha" noValidate onSubmit={(e) => void handleSubmit(salvar)(e)}>
        <Campo rotulo="Título" maxLength={200} autoComplete="off" erro={errors.titulo?.message} {...register('titulo')} />
        <div className="tf-form-grade">
          <CampoSelecao rotulo="Modalidade" opcoes={MODALIDADES} erro={errors.modalidade?.message} {...register('modalidade')} />
          <CampoSelecao
            rotulo="Tema"
            dica="A aba do módulo em que o material se encaixa."
            opcoes={TEMAS}
            erro={errors.secao?.message}
            {...register('secao')}
          />
        </div>
        <CampoTextoLongo
          rotulo="Texto"
          rows={12}
          maxLength={20000}
          dica="Texto simples ou Markdown: # para título, - para lista, **negrito**. HTML não é aceito."
          erro={errors.corpo?.message}
          {...register('corpo')}
        />
        <CampoTextoLongo
          rotulo="Referências (opcional)"
          maxLength={2000}
          dica="Autor, ano e título de cada fonte. Exemplo: Johnson, 2007."
          erro={errors.referencias?.message}
          {...register('referencias')}
        />
        <div className="tf-acoes">
          <Botao type="submit" carregando={isSubmitting}>
            Salvar rascunho
          </Botao>
          <BotaoLink to="/criar-conteudo">Voltar para seus materiais</BotaoLink>
        </div>
      </form>

      {material ? (
        <AnexosDoMaterial material={material} editavel />
      ) : (
        <p className="tf-sub">Salve o rascunho para anexar arquivos.</p>
      )}

      {material && (
        <div className="tf-acoes">
          <Dialogo
            titulo="Enviar para revisão?"
            descricao="O texto que está na tela é salvo e enviado. Até a revisão terminar, o material não pode ser alterado."
            aberto={confirmarEnvio}
            aoFechar={() => {
              if (!ocupado) setConfirmarEnvio(false)
            }}
            gatilho={<Botao onClick={() => setConfirmarEnvio(true)}>Enviar para revisão</Botao>}
            acoes={
              <>
                <Botao variante="secundario" disabled={ocupado} onClick={() => setConfirmarEnvio(false)}>
                  Cancelar
                </Botao>
                <Botao carregando={ocupado} onClick={() => void handleSubmit(enviar)()}>
                  Enviar
                </Botao>
              </>
            }
          >
            <p className="tf-sub">Confira os anexos: depois de enviados, eles também ficam como estão.</p>
          </Dialogo>
          <Dialogo
            titulo="Excluir rascunho?"
            descricao="O texto e os anexos são apagados. Esta ação não pode ser desfeita pela tela."
            aberto={confirmarExclusao}
            aoFechar={() => {
              if (!ocupado) setConfirmarExclusao(false)
            }}
            gatilho={
              <Botao variante="ghost" onClick={() => setConfirmarExclusao(true)}>
                Excluir rascunho
              </Botao>
            }
            acoes={
              <>
                <Botao variante="secundario" disabled={ocupado} onClick={() => setConfirmarExclusao(false)}>
                  Cancelar
                </Botao>
                <Botao carregando={ocupado} onClick={() => void excluir()}>
                  Excluir
                </Botao>
              </>
            }
          >
            <p className="tf-sub">{material.titulo}</p>
          </Dialogo>
        </div>
      )}
    </section>
  )
}

/** Depois de enviado: leitura, com o estado e os anexos. Volta a ser editável se a revisão devolver. */
function MaterialEnviado({ material }: { material: Material }) {
  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <p className="tf-modulo__kicker">
          {material.modalidade} · {ROTULO_SECAO[material.secao]}
        </p>
        <h1 className="tf-titulo">{material.titulo}</h1>
        <p className="tf-linha">
          <span className="tf-etiqueta">{rotuloDoEstado(material)}</span>
          <span className="tf-sub">
            {material.estado === 'APROVADO' && material.dataRevisao
              ? `Aprovado na revisão docente em ${formatarData(material.dataRevisao)}.`
              : 'Na fila da revisão docente. Se for devolvido, você poderá alterar e enviar de novo.'}
          </span>
        </p>
      </div>

      <article className="tf-cartao tf-pilha" aria-label="Texto do material">
        <CorpoMarkdown texto={material.corpo} />
        <p className="tf-sub">
          <strong>Referências:</strong> {material.referencias ?? 'nenhuma informada.'}
        </p>
      </article>

      <Alerta intencao="info" titulo={AVISOS.validacao} />
      <AnexosDoMaterial material={material} editavel={false} />
      <BotaoLink to="/criar-conteudo">Voltar para seus materiais</BotaoLink>
    </section>
  )
}
