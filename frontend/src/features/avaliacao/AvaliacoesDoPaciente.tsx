import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { BotaoLink } from '../../shared/ui/Botao'
import { formatarData } from '../pacientes/formatar'
import { chaveAvaliacoes, listarAvaliacoes } from './api'

/** Avaliações do paciente, da mais recente para a mais antiga; clicar em "Data" inverte. */
export function AvaliacoesDoPaciente({ pacienteId }: { pacienteId: string }) {
  const [direcao, setDirecao] = useState<'asc' | 'desc'>('desc')
  const { data, isPending, isError } = useQuery({
    queryKey: [...chaveAvaliacoes(pacienteId), direcao],
    queryFn: () => listarAvaliacoes(pacienteId, direcao),
  })

  return (
    <section className="tf-cartao tf-pilha" aria-labelledby="titulo-avaliacoes">
      <div className="tf-pacientes__topo">
        <h2 id="titulo-avaliacoes" className="tf-cartao__titulo">
          Avaliações
        </h2>
        <BotaoLink variante="secundario" to={`/pacientes/${pacienteId}/avaliacoes/nova`}>
          Nova avaliação
        </BotaoLink>
      </div>

      {isPending && <p className="tf-sub">Carregando avaliações…</p>}
      {isError && <p className="tf-sub">Não foi possível carregar as avaliações.</p>}
      {data && data.length === 0 && <p className="tf-sub">Nenhuma avaliação registrada.</p>}

      {data && data.length > 0 && (
        <div className="tf-tabela__rolagem">
          <table className="tf-tabela">
            <caption className="tf-sr-only">
              Avaliações, da {direcao === 'desc' ? 'mais recente para a mais antiga' : 'mais antiga para a mais recente'}
            </caption>
            <thead>
              <tr>
                <th scope="col" aria-sort={direcao === 'asc' ? 'ascending' : 'descending'}>
                  <button
                    type="button"
                    className="tf-tabela__ordenar"
                    onClick={() => setDirecao((d) => (d === 'desc' ? 'asc' : 'desc'))}
                  >
                    Data
                    <span aria-hidden="true" className="tf-tabela__seta">
                      {direcao === 'asc' ? '▲' : '▼'}
                    </span>
                  </button>
                </th>
                <th scope="col">Dor (0 a 10)</th>
                <th scope="col">Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link className="tf-link" to={`/pacientes/${pacienteId}/avaliacoes/${a.id}`}>
                      {formatarData(a.dataAvaliacao)}
                    </Link>
                  </td>
                  <td>{a.dorEscala ?? 'Não avaliada'}</td>
                  <td>{a.objetivo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
