import type { Sessao } from './api'
import { dataSessao } from './dataSessao'

export function Evolucao({ sessoes }: { sessoes: Sessao[] }) {
  const cronologia = [...sessoes].sort((a, b) => Date.parse(a.dataHora) - Date.parse(b.dataHora))
  return (
    <section className="tf-pilha">
      <h2>Evolução</h2>
      <p>Compare sessões com medidas equivalentes. Registre a tarefa, o momento da avaliação e as mudanças no contexto antes de interpretar a evolução.</p>
      {cronologia.length === 0 ? <p>Nenhuma sessão registrada.</p> : (
        <>
          <figure aria-hidden="true" className="tf-evolucao-grafico">
            <figcaption>Dor por sessão (0 a 10)</figcaption>
            {cronologia.map((s) => (
              <div className="tf-evolucao-par" key={s.id}>
                <strong>{dataSessao(s.dataHora)}</strong>
                <div>{[s.dorTarefa, s.dorMomento, s.medidaContexto].filter(Boolean).join(' · ')}</div>
                {([['Antes', s.dorAntes], ['Depois', s.dorDepois]] as const).map(([rotulo, valor]) => (
                  <div className="tf-evolucao-barra" key={rotulo}>
                    <span>{rotulo}</span>
                    {valor != null && <meter min={0} max={10} value={valor} />}
                    <span>{valor ?? 'Não avaliada'}</span>
                  </div>
                ))}
              </div>
            ))}
          </figure>
          <div className="tf-tabela__rolagem">
            <table className="tf-tabela">
              <caption>Dor por sessão (0 a 10)</caption>
              <thead><tr>
                <th scope="col">Data</th><th scope="col">Antes</th><th scope="col">Depois</th>
                <th scope="col">Tarefa</th><th scope="col">Momento</th><th scope="col">Contexto</th>
              </tr></thead>
              <tbody>{cronologia.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{dataSessao(s.dataHora)}</th>
                  <td>{s.dorAntes ?? 'Não avaliada'}</td><td>{s.dorDepois ?? 'Não avaliada'}</td>
                  <td>{s.dorTarefa ?? '—'}</td><td>{s.dorMomento ?? '—'}</td><td>{s.medidaContexto ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
