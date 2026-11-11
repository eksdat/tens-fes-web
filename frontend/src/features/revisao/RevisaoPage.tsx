import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao } from '../../shared/ui/Botao'
import { useToast } from '../../shared/ui/useToast'
import { CorpoMarkdown } from '../modulo/CorpoMarkdown'
import { formatarData } from '../pacientes/formatar'
import {
  aprovarConteudo,
  CHAVE_REVISAO,
  devolverConteudo,
  lerErroRevisao,
  listarEmRevisao,
  ROTULO_BLOCO,
  ROTULO_SECAO,
  type ConteudoEmRevisao,
} from './api'
import { DevolverConteudo } from './DevolverConteudo'

type Grupo = { id: string; titulo: string; conteudos: ConteudoEmRevisao[] }

/** Agrupa a fila (já ordenada pela API) por módulo e aba, na ordem em que chegou. */
function agrupar(fila: ConteudoEmRevisao[]): Grupo[] {
  const grupos = new Map<string, Grupo>()
  for (const conteudo of fila) {
    const id = `grupo-${conteudo.modalidade}-${conteudo.secao}`
    const grupo = grupos.get(id) ?? { id, titulo: `${conteudo.modalidade} · ${ROTULO_SECAO[conteudo.secao]}`, conteudos: [] }
    grupo.conteudos.push(conteudo)
    grupos.set(id, grupo)
  }
  return [...grupos.values()]
}

/**
 * Fila do revisor (guia técnico, seção 23). O texto decidido continua na tela com o resultado, para quem revisa
 * seguir para o próximo sem perder o lugar; ao voltar para a página, a fila vem atualizada da API.
 */
export function RevisaoPage() {
  const fila = useQuery({ queryKey: CHAVE_REVISAO, queryFn: listarEmRevisao })
  const [decididos, setDecididos] = useState<Record<number, ConteudoEmRevisao>>({})
  const queryClient = useQueryClient()
  const { mostrar } = useToast()

  function registrar(decidido: ConteudoEmRevisao) {
    setDecididos((atuais) => ({ ...atuais, [decidido.id]: decidido }))
    // A página técnica de TENS e FES pode ter acabado de abrir para os estudantes.
    void queryClient.invalidateQueries({ queryKey: ['conteudos'] })
    if (decidido.estado === 'APROVADO') {
      mostrar({
        tipo: 'sucesso',
        titulo: 'Conteúdo aprovado',
        texto: 'A aba abre para os estudantes quando todos os blocos dela estiverem aprovados.',
      })
    } else {
      mostrar({ tipo: 'info', titulo: 'Conteúdo devolvido', texto: 'O texto voltou para rascunho com o motivo.' })
    }
  }

  const pendentes = fila.data?.filter((c) => !decididos[c.id]).length ?? 0

  return (
    <section className="tf-pagina">
      <div className="tf-pilha">
        <h1 className="tf-titulo">Revisão de conteúdo</h1>
        <p className="tf-sub">
          Só o que você aprovar aparece para os estudantes. Confira o texto e a fonte antes de aprovar: exemplo não é
          prescrição.
        </p>
      </div>

      {fila.isPending && <p className="tf-sub">Carregando a fila de revisão…</p>}
      {fila.isError && (
        <Alerta intencao="perigo" titulo="Não foi possível carregar a fila de revisão">
          Tente de novo em instantes.
        </Alerta>
      )}

      {fila.data && (
        <output className="tf-sub">
          {pendentes === 0
            ? 'Nenhum conteúdo esperando revisão.'
            : `${pendentes} ${pendentes === 1 ? 'texto esperando' : 'textos esperando'} revisão.`}
        </output>
      )}

      {fila.data &&
        agrupar(fila.data).map((grupo) => (
          <section key={grupo.id} className="tf-pilha" aria-labelledby={grupo.id}>
            <h2 id={grupo.id} className="tf-subtitulo">
              {grupo.titulo}
            </h2>
            {grupo.conteudos.map((conteudo) => (
              <ItemDaFila key={conteudo.id} conteudo={conteudo} decidido={decididos[conteudo.id]} aoDecidir={registrar} />
            ))}
          </section>
        ))}
    </section>
  )
}

type ItemProps = {
  conteudo: ConteudoEmRevisao
  decidido?: ConteudoEmRevisao
  aoDecidir: (decidido: ConteudoEmRevisao) => void
}

function ItemDaFila({ conteudo, decidido, aoDecidir }: ItemProps) {
  const [erro, setErro] = useState<string | null>(null)
  const [aprovando, setAprovando] = useState(false)
  const resultado = useRef<HTMLParagraphElement>(null)
  const idTitulo = `conteudo-${conteudo.id}`

  // Os botões somem depois da decisão: o foco vai para o resultado, e não para o começo da página.
  useEffect(() => {
    if (decidido) resultado.current?.focus()
  }, [decidido])

  async function aprovar() {
    setErro(null)
    setAprovando(true)
    try {
      aoDecidir(await aprovarConteudo(conteudo.id))
    } catch (e) {
      setErro(lerErroRevisao(e))
    } finally {
      setAprovando(false)
    }
  }

  async function devolver(motivo: string) {
    setErro(null)
    try {
      aoDecidir(await devolverConteudo(conteudo.id, motivo))
      return true
    } catch (e) {
      setErro(lerErroRevisao(e))
      return false
    }
  }

  return (
    <article className="tf-cartao tf-pilha" aria-labelledby={idTitulo}>
      <p className="tf-modulo__kicker">
        {conteudo.bloco ? ROTULO_BLOCO[conteudo.bloco] : 'Texto da aba'} · versão {conteudo.versao}
      </p>
      <h3 id={idTitulo} className="tf-cartao__titulo">
        {conteudo.titulo}
      </h3>
      <CorpoMarkdown texto={conteudo.corpo} />
      <p className="tf-sub">
        <strong>Fonte:</strong> {conteudo.referencias ?? 'nenhuma informada. Conteúdo sem fonte não deve ser aprovado.'}
      </p>

      {erro && (
        <Alerta intencao="perigo" titulo="Não foi possível concluir a revisão">
          {erro}
        </Alerta>
      )}

      {decidido ? (
        <p ref={resultado} tabIndex={-1} className="tf-sub">
          {decidido.estado === 'APROVADO'
            ? `Aprovado em ${formatarData(decidido.dataRevisao ?? '')}.`
            : `Devolvido para rascunho. Motivo: ${decidido.motivoDevolucao}`}
        </p>
      ) : (
        <div className="tf-acoes">
          {/* O nome do texto vai no rótulo: no leitor de tela, "Aprovar" sozinho se repete a cada item. */}
          <Botao carregando={aprovando} aria-label={`Aprovar ${conteudo.titulo}`} onClick={() => void aprovar()}>
            Aprovar
          </Botao>
          <DevolverConteudo titulo={conteudo.titulo} aoDevolver={devolver} />
        </div>
      )}
    </article>
  )
}
