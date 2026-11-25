import { dataSessao } from '../sessao/dataSessao'

export function HistoricoAlteracoes({ alteracoes, profissional }: {
  alteracoes?: { autor: string; dataHora: string }[]
  profissional?: { id: string; nome: string }
}) {
  if (!alteracoes?.length) return null
  return (
    <details>
      <summary>Histórico de alterações</summary>
      <ul>{alteracoes.map(({ autor, dataHora }) => (
        <li key={autor + dataHora}>
          {dataSessao(dataHora)} · {profissional?.id === autor ? profissional.nome : autor}
        </li>
      ))}</ul>
    </details>
  )
}
