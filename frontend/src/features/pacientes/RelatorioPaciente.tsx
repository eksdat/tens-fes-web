import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Botao } from '../../shared/ui/Botao'
import { chaveAvaliacoes, ITENS_TRIAGEM, listarAvaliacoes, ROTULO_ESTADO, ROTULO_LADO } from '../avaliacao/api'
import { chaveSessoes, listarSessoes } from '../sessao/api'
import { dataSessao } from '../sessao/dataSessao'
import { Evolucao } from '../sessao/Evolucao'
import type { Paciente } from './api'
import { formatarData } from './formatar'
import './relatorio.css'

const secoes = ['Identificação', 'Avaliação', 'Sessões', 'Evolução'] as const

export function RelatorioPaciente({ paciente, profissional }: {
  paciente: Paciente
  profissional: { id: string; nome: string }
}) {
  const [selecionadas, selecionar] = useState<readonly string[]>(secoes)
  const [sessoesIds, selecionarSessoes] = useState<string[] | null>(null)
  const incluirAvaliacao = selecionadas.includes('Avaliação')
  const incluirSessoes = selecionadas.includes('Sessões')
  const incluirEvolucao = selecionadas.includes('Evolução')
  const precisaSessoes = incluirSessoes || incluirEvolucao
  const avaliacoes = useQuery({
    queryKey: [...chaveAvaliacoes(paciente.id), 'desc'],
    queryFn: () => listarAvaliacoes(paciente.id, 'desc'),
    enabled: incluirAvaliacao,
  })
  const sessoes = useQuery({
    queryKey: chaveSessoes(paciente.id),
    queryFn: () => listarSessoes(paciente.id),
    enabled: precisaSessoes,
  })
  const erro = (incluirAvaliacao && avaliacoes.isError) || (precisaSessoes && sessoes.isError)
  const carregando = (incluirAvaliacao && avaliacoes.isPending) || (precisaSessoes && sessoes.isPending)
  const sessoesIncluidas = (sessoes.data ?? []).filter((s) => !sessoesIds || sessoesIds.includes(s.id))
  const datas = [
    ...(incluirAvaliacao ? (avaliacoes.data ?? []).map((a) => a.dataAvaliacao) : []),
    ...(precisaSessoes ? sessoesIncluidas.map((s) => new Date(s.dataHora).toLocaleDateString('sv-SE')) : []),
  ].sort()
  const podeImprimir = !erro && !carregando && selecionadas.length > 0

  return (
    <section className="tf-cartao tf-pilha">
      <h2>Relatório do paciente</h2>
      <fieldset>
        <legend>Seções do relatório</legend>
        {secoes.map((secao) => (
          <label className="tf-relatorio-opcao" key={secao}>
            <input type="checkbox" checked={selecionadas.includes(secao)} onChange={(e) =>
              selecionar(e.target.checked ? [...selecionadas, secao] : selecionadas.filter((s) => s !== secao))} />
            {secao}
          </label>
        ))}
      </fieldset>
      {precisaSessoes && !!sessoes.data?.length && (
        <fieldset>
          <legend>Sessões incluídas no relatório</legend>
          {sessoes.data.map((s) => (
            <label className="tf-relatorio-opcao" key={s.id}>
              <input type="checkbox" checked={!sessoesIds || sessoesIds.includes(s.id)} onChange={(e) =>
                selecionarSessoes(e.target.checked
                  ? [...sessoesIncluidas.map((item) => item.id), s.id]
                  : sessoesIncluidas.filter((item) => item.id !== s.id).map((item) => item.id))} />
              {dataSessao(s.dataHora)} · {s.modalidade}
            </label>
          ))}
        </fieldset>
      )}
      {erro && <p role="alert">Não foi possível carregar os dados do relatório.</p>}
      {carregando && !erro && <output>Carregando dados do relatório…</output>}
      <Botao type="button" disabled={!podeImprimir} onClick={() => window.print()}>Imprimir relatório</Botao>
      {podeImprimir && createPortal(
        <article className="tf-relatorio-impressao">
          <h1>Relatório do paciente</h1>
          <p>Profissional responsável · {profissional.nome}</p>
          {!!datas.length && <p>Período · {formatarData(datas[0])} a {formatarData(datas[datas.length - 1])}</p>}
          {selecionadas.includes('Identificação') && (
            <section>
              <h2>Identificação</h2>
              <p>{paciente.nome} {paciente.sobrenome} · {paciente.identificador}</p>
              <p>Nascimento · {formatarData(paciente.dataNascimento)}</p>
            </section>
          )}
          {incluirAvaliacao && (
            <section>
              <h2>Avaliação</h2>
              {!avaliacoes.data?.length && <p>Nenhuma avaliação registrada.</p>}
              {avaliacoes.data?.map((a) => (
                <section key={a.id}>
                  <h3>{formatarData(a.dataAvaliacao)}</h3>
                  <p>Queixa · {a.queixa ?? '—'}</p>
                  <p>Histórico · {a.historico ?? '—'}</p>
                  <p>Objetivo · {a.objetivo ?? '—'}</p>
                  <p>Dor (0 a 10) · {a.dorEscala ?? 'Não avaliada'} · {a.dorTarefa ?? '—'} · {a.dorMomento ?? '—'} · {a.dorContexto ?? '—'}</p>
                  <h4>Triagem</h4>
                  <ul>{ITENS_TRIAGEM.map(({ item, rotulo }) => <li key={item}>{rotulo} · {ROTULO_ESTADO[a.triagem[item]] ?? 'Não avaliado'}</li>)}</ul>
                  {!!a.achados.length && <ul>{a.achados.map((achado, indice) => (
                    <li key={indice}>{achado.descricao} · {ROTULO_ESTADO[achado.estado]} · {ROTULO_LADO[achado.lado]} · {achado.regiao} · {achado.metodo}</li>
                  ))}</ul>}
                  <p>Plano · {a.plano ?? '—'}</p>
                </section>
              ))}
            </section>
          )}
          {incluirSessoes && (
            <section>
              <h2>Sessões</h2>
              {!sessoesIncluidas.length && <p>Nenhuma sessão selecionada.</p>}
              {sessoesIncluidas.map((s) => (
                <section key={s.id}>
                  <h3>{dataSessao(s.dataHora)} · {s.modalidade}</h3>
                  <p>Autor · {s.profissionalId === profissional.id ? profissional.nome : s.profissionalId}</p>
                  <p>Objetivo · {s.objetivo}</p>
                  <p>Aplicação · {s.aparelho} · {s.modo ?? '—'} · {s.duracaoRealMin} min</p>
                  <p>Dor (0 a 10) · {s.dorAntes ?? 'Não avaliada'} / {s.dorDepois ?? 'Não avaliada'} · {s.dorTarefa ?? '—'} · {s.dorMomento ?? '—'}</p>
                  <p>Outras medidas · {s.medidaAntes ?? '—'} / {s.medidaDepois ?? '—'} · {s.medidaContexto ?? '—'}</p>
                  <p>Resposta e ajustes · {[s.sensacao, s.contracao, s.tolerancia, s.fadiga, s.ajustes].filter(Boolean).join(' · ') || '—'}</p>
                  <p>Pele · {s.condicaoPele}</p>
                  <p>Encerramento · {s.motivoTermino}</p>
                  <p>Reavaliação · {s.planoReavaliacao}</p>
                </section>
              ))}
            </section>
          )}
          {incluirEvolucao && <Evolucao sessoes={sessoesIncluidas} />}
        </article>,
        document.body,
      )}
    </section>
  )
}
