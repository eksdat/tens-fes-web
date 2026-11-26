import axios from 'axios'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'
import { CorpoMarkdown } from '../modulo/CorpoMarkdown'
import './casos-clinicos.css'

const campos = [
  ['titulo', 'Título'],
  ['objetivo', 'Objetivo'],
  ['contexto', 'Contexto'],
  ['avaliacao', 'Avaliação do cenário'],
  ['modalidade', 'Modalidade'],
  ['parametros', 'Parâmetros com unidades'],
  ['montagem', 'Montagem dos eletrodos'],
  ['justificativa', 'Justificativa'],
  ['duvida', 'Dúvida'],
] as const

type Caso = Record<typeof campos[number][0], string>
type Resumo = { id: string; titulo: string; criadoEm: string }
type Detalhe = {
  caso: Caso
  anexos: { id: string; nome: string }[]
  origem: {
    liberada: boolean
    blocos: { bloco: string; titulo: string; corpo: string }[]
    referencias: string[]
    dataRevisao: string | null
  }
}

const rota = '/casos-clinicos'
const modalidades = ['TENS', 'NMES', 'FES'].map((valor) => ({ valor, rotulo: valor }))

export function CasosClinicosPage() {
  const cliente = useQueryClient()
  const [id, selecionar] = useState('')
  const [erro, setErro] = useState('')
  const lista = useQuery({
    queryKey: [rota],
    queryFn: async () => (await api.get<Resumo[]>(rota)).data,
    gcTime: 0,
  })
  const detalhe = useQuery({
    queryKey: [rota, id],
    queryFn: async () => (await api.get<Detalhe>(`${rota}/${id}`)).data,
    enabled: Boolean(id),
    gcTime: 0,
  })
  const envio = useMutation({
    mutationFn: async (dados: FormData) => (await api.post<string>(rota, dados)).data,
    gcTime: 0,
  })

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const caso = Object.fromEntries(campos.map(([chave]) => [chave, String(dados.get(chave) ?? '').trim()]))
    if (Object.values(caso).some((valor) => !valor)) {
      setErro('Preencha todos os campos do caso.')
      return
    }
    const anexos = Array.from(formulario.querySelector<HTMLInputElement>('#caso-anexos')?.files ?? [])
    if (anexos.length > 5 || anexos.reduce((total, arquivo) => total + arquivo.size, 0) > 10 * 1024 * 1024) {
      setErro('Envie até cinco anexos, somando até 10 MB.')
      return
    }
    const corpo = new FormData()
    corpo.append('caso', new Blob([JSON.stringify(caso)], { type: 'application/json' }))
    anexos.forEach((arquivo) => corpo.append('anexos', arquivo))
    setErro('')
    try {
      const novo = await envio.mutateAsync(corpo)
      formulario.reset()
      selecionar(novo)
      await cliente.invalidateQueries({ queryKey: [rota], exact: true })
    } catch (falha) {
      setErro(axios.isAxiosError(falha) && falha.response?.status === 400
        ? 'Confira os campos e envie apenas anexos PDF, PNG ou JPEG com nomes válidos.'
        : 'Não foi possível enviar o caso. Tente novamente.')
    }
  }

  async function baixar(anexo: Detalhe['anexos'][number]) {
    setErro('')
    try {
      const { data } = await api.get<Blob>(`${rota}/${id}/anexos/${anexo.id}`, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = anexo.nome
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setErro('Não foi possível baixar o anexo.')
    }
  }

  return (
    <section className="tf-pagina" aria-labelledby="titulo-casos">
      <h1 id="titulo-casos" className="tf-titulo">Meus casos clínicos</h1>
      <form className="tf-cartao tf-pilha" onSubmit={enviar} aria-labelledby="novo-caso">
        <h2 id="novo-caso">Enviar caso clínico</h2>
        <Alerta intencao="atencao" titulo="Use caso fictício. Não inclua identificação de pacientes." />
        <p className="tf-sub">Descreva o objetivo de estudo e registre pele, sensibilidade, capacidade de relatar desconforto, resposta motora, riscos e restrições.</p>
        <fieldset className="tf-pilha tf-caso-campos" disabled={envio.isPending} aria-label="Dados do caso">
          <div className="tf-form-grade">
            {campos.map(([chave, rotulo]) => {
              const campo = { id: `caso-${chave}`, name: chave, rotulo, required: true }
              if (chave === 'titulo') return <Campo key={chave} {...campo} maxLength={120} />
              if (chave === 'modalidade') {
                return <CampoSelecao key={chave} {...campo} opcoes={modalidades} defaultValue="" />
              }
              return <CampoTextoLongo key={chave} {...campo} maxLength={2000} />
            })}
          </div>
          <Campo id="caso-anexos" name="anexos" rotulo="Anexos opcionais" type="file" multiple
            accept="application/pdf,image/png,image/jpeg"
            dica="PDF, PNG ou JPEG. Até cinco arquivos, somando até 10 MB. Use apenas material permitido, sem identificação pessoal ou prontuário real." />
          <div className="tf-acoes">
            <Botao type="submit" carregando={envio.isPending}>{envio.isPending ? 'Enviando…' : 'Enviar caso'}</Botao>
          </div>
        </fieldset>
      </form>
      {erro && <Alerta intencao="perigo" titulo={erro} />}
      <section className="tf-cartao tf-pilha">
        <h2>Casos enviados</h2>
        {lista.isPending && <output>Carregando casos…</output>}
        {lista.isError && <Alerta intencao="perigo" titulo="Não foi possível carregar os casos." />}
        {lista.data?.length === 0 && <p className="tf-sub">Você ainda não enviou casos.</p>}
        {lista.data && lista.data.length > 0 && (
          <ul className="tf-lista-simples">
            {lista.data.map((caso) => (
              <li key={caso.id}>
                <Botao variante={id === caso.id ? 'primario' : 'secundario'} aria-pressed={id === caso.id} onClick={() => selecionar(caso.id)}>
                  {caso.titulo} · {new Date(caso.criadoEm).toLocaleDateString('pt-BR')}
                </Botao>
              </li>
            ))}
          </ul>
        )}
      </section>
      {id && detalhe.isPending && <output>Carregando caso…</output>}
      {detalhe.isError && <Alerta intencao="perigo" titulo="Não foi possível carregar o caso." />}
      {detalhe.data && (
        <section className="tf-cartao tf-pilha" aria-label="Detalhes do caso">
          <h2>{detalhe.data.caso.titulo}</h2>
          <dl className="tf-form-grade tf-caso-detalhes">
            {campos.slice(1).map(([chave, rotulo]) => (
              <div key={chave}><dt>{rotulo}</dt><dd>{detalhe.data.caso[chave]}</dd></div>
            ))}
          </dl>
          {detalhe.data.anexos.map((anexo) => (
            <Botao variante="secundario" key={anexo.id} onClick={() => void baixar(anexo)}>{anexo.nome}</Botao>
          ))}
          <RespostaEducativa detalhe={detalhe.data} />
        </section>
      )}
    </section>
  )
}

function RespostaEducativa({ detalhe }: { detalhe: Detalhe }) {
  const { caso, origem } = detalhe
  return (
    <>
      <h3>Resposta educativa</h3>
      <p>Objetivo informado para estudo: {caso.objetivo}</p>
      <p>Você registrou a avaliação, a modalidade, os parâmetros e a montagem. Confira se a avaliação descreve os critérios de segurança relevantes.</p>
      {origem.liberada && origem.blocos.map((bloco) => (
        <div key={bloco.bloco}><h4>{bloco.titulo}</h4><CorpoMarkdown texto={bloco.corpo} /></div>
      ))}
      <p>Não encontrei, na base revisada, conteúdo suficiente para sustentar essa orientação. Posso explicar os conceitos gerais, mas a decisão deste caso requer avaliação do professor ou profissional responsável.</p>
      {origem.liberada && (
        <>
          <h4>Referências da base revisada</h4>
          {origem.dataRevisao && <p>Data de revisão: <time dateTime={origem.dataRevisao}>{origem.dataRevisao.split('-').reverse().join('/')}</time></p>}
          <ul>{origem.referencias.map((referencia) => <li key={referencia}>{referencia}</li>)}</ul>
        </>
      )}
      <p>Que achado da avaliação você usaria para justificar a escolha da modalidade?</p>
      <p>Esta resposta educativa não substitui avaliação, diagnóstico, prescrição ou decisão clínica.</p>
    </>
  )
}
