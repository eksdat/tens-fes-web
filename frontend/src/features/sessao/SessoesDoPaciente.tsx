import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BotaoLink } from '../../shared/ui/Botao'
import { chaveSessoes, listarSessoes } from './api'

/** Histórico de sessões; a API devolve da mais recente para a mais antiga e clicar em "Data" inverte aqui. */
export function SessoesDoPaciente({ pacienteId }: { pacienteId: string }) {
  const [direcao, setDirecao] = useState<'asc' | 'desc'>('desc')
  const { data, isPending, isError } = useQuery({
    queryKey: chaveSessoes(pacienteId),
    queryFn: () => listarSessoes(pacienteId),
  })
  const sessoes = direcao === 'desc' ? data : data && [...data].reverse()

  return (
    <section className="tf-cartao tf-pilha" aria-labelledby="titulo-sessoes">
      <div className="tf-pacientes__topo">
        <h2 id="titulo-sessoes" className="tf-cartao__titulo">
          Sessões
        </h2>
        <BotaoLink variante="secundario" to={`/pacientes/${pacienteId}/sessoes/nova`}>
          Registrar sessão
        </BotaoLink>
      </div>

      {isPending && <p className="tf-sub">Carregando sessões…</p>}
      {isError && <p className="tf-sub">Não foi possível carregar as sessões.</p>}
      {sessoes && sessoes.length === 0 && <p className="tf-sub">Nenhuma sessão registrada.</p>}

      {sessoes && sessoes.length > 0 && (
        <div className="tf-tabela__rolagem">
          <table className="tf-tabela">
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
                <th scope="col">Modalidade</th>
                <th scope="col">Duração</th>
                <th scope="col">Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {sessoes.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>{s.modalidade}</td>
                  <td>{s.duracaoRealMin} min</td>
                  <td>{s.objetivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
