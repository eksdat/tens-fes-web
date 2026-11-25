import type { Sessao } from './api'
import { dataSessao } from './dataSessao'
import './evolucao.css'

const ESCALA = [10, 8, 6, 4, 2, 0]
const SERIES = [
  { rotulo: 'Antes', campo: 'dorAntes', estilo: 'antes' },
  { rotulo: 'Depois', campo: 'dorDepois', estilo: 'depois' },
] as const

const altura = (dor: number) => 8 + (10 - dor) * 16

function comparaveis(a: Sessao, b: Sessao) {
  return Boolean(a.dorTarefa && a.dorMomento && a.dorTarefa === b.dorTarefa
    && a.dorMomento === b.dorMomento && a.medidaContexto === b.medidaContexto)
}

function GraficoDor({ sessoes }: { sessoes: Sessao[] }) {
  const posicao = (indice: number) => 500 * (indice + 0.5) / sessoes.length
  const intervalo = Math.max(1, Math.ceil(sessoes.length / 4))
  return (
    <figure className="tf-evolucao-grafico" aria-hidden="true">
      <figcaption>Dor por sessão (0 a 10)</figcaption>
      <div className="tf-evolucao-legenda">
        {SERIES.map(({ rotulo, estilo }) => <span key={estilo}><i className={`tf-evolucao-${estilo}`} />{rotulo}</span>)}
      </div>
      <div className="tf-evolucao-plot">
        <svg viewBox="0 0 500 176" preserveAspectRatio="none">
          {ESCALA.map((valor) => <line className="tf-evolucao-guia" key={valor} x1="0" x2="500" y1={altura(valor)} y2={altura(valor)} />)}
          {SERIES.map(({ campo, estilo }) => (
            <g key={campo} className={`tf-evolucao-${estilo}`} data-serie={campo}>
              {sessoes.map((sessao, i) => {
                const valor = sessao[campo]
                const anterior = sessoes[i - 1]
                const anteriorValor = anterior?.[campo]
                if (valor == null || anteriorValor == null || !comparaveis(anterior, sessao)) return null
                return <line key={sessao.id} x1={posicao(i - 1)} y1={altura(anteriorValor)} x2={posicao(i)} y2={altura(valor)} />
              })}
              {sessoes.map((sessao, i) => {
                const valor = sessao[campo]
                if (valor == null) return null
                const x = posicao(i)
                const y = altura(valor)
                return estilo === 'antes'
                  ? <rect key={sessao.id} x={x - 3} y={y - 3} width="6" height="6" data-valor={valor} />
                  : <circle key={sessao.id} cx={x} cy={y} r="4" data-valor={valor} />
              })}
            </g>
          ))}
        </svg>
        {ESCALA.map((valor) => <span className="tf-evolucao-eixo" key={valor} style={{ top: altura(valor) }}>{valor}</span>)}
      </div>
      <div className="tf-evolucao-datas">
        {sessoes.map((sessao, i) => i % intervalo === 0 && (
          <span key={sessao.id} style={{ left: `${posicao(i) / 5}%` }}>{dataSessao(sessao.dataHora).slice(0, 5)}</span>
        ))}
      </div>
    </figure>
  )
}

export function Evolucao({ sessoes }: { sessoes: Sessao[] }) {
  const cronologia = [...sessoes].sort((a, b) => Date.parse(a.dataHora) - Date.parse(b.dataHora))
  return (
    <section className="tf-pilha tf-evolucao">
      <h2 className="tf-titulo tf-titulo--secao">Evolução da dor</h2>
      <p>Compare sessões com medidas equivalentes. Registre a tarefa, o momento da avaliação e as mudanças no contexto antes de interpretar a evolução.</p>
      {cronologia.length === 0 ? <p>Nenhuma sessão registrada.</p> : (
        <>
          <GraficoDor sessoes={cronologia} />
          <h3 className="tf-subtitulo">Detalhes por sessão</h3>
          <div className="tf-tabela__rolagem">
            <table className="tf-tabela">
              <caption className="tf-sr-only">Dor por sessão (0 a 10)</caption>
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
