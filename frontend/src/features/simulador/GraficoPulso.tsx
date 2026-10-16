import { periodoMs, tempoOn, type Rampas } from './calculos'

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

type Props = { frequenciaHz: number; larguraUs: number; rampas?: Rampas }

/**
 * Desenhos esquemáticos, sem escala de intensidade: forma quadrática simétrica bifásica (manual do Neurodyn, cap. 8.2.4).
 * São decorativos para o leitor de tela; a tabela e a descrição ao lado trazem os mesmos valores.
 */
export function GraficoPulso({ frequenciaHz, larguraUs, rampas }: Props) {
  const periodo = periodoMs(frequenciaHz)
  // Fração do período ocupada pelo pulso (duas fases); mínimo visível de 2% para pulsos muito curtos.
  const ocupacao = Math.max(0.02, Math.min(0.9, (2 * larguraUs) / 1000 / periodo))
  const larguraPeriodo = 280 / 4
  const trem = Array.from({ length: 4 }, (_, i) => {
    const x = 10 + i * larguraPeriodo
    const meia = (larguraPeriodo * ocupacao) / 2
    return `M${x} 60 V25 H${x + meia} V95 H${x + 2 * meia} V60 H${x + larguraPeriodo}`
  }).join(' ')

  return (
    <div className="tf-grafico" aria-hidden="true">
      <figure className="tf-grafico__item">
        <svg viewBox="0 0 300 120" className="tf-grafico__svg">
          <line x1="0" y1="60" x2="300" y2="60" className="tf-grafico__eixo" />
          <path d="M10 60 H70 V20 H150 V60 V100 H230 V60 H290" className="tf-grafico__linha" />
          <text x="110" y="14" className="tf-grafico__rotulo" textAnchor="middle">
            fase {numero.format(larguraUs)} µs
          </text>
          <text x="190" y="116" className="tf-grafico__rotulo" textAnchor="middle">
            fase {numero.format(larguraUs)} µs
          </text>
        </svg>
        <figcaption className="tf-grafico__legenda">Um pulso: duas fases iguais, uma de cada lado</figcaption>
      </figure>

      <figure className="tf-grafico__item">
        <svg viewBox="0 0 300 120" className="tf-grafico__svg">
          <line x1="0" y1="60" x2="300" y2="60" className="tf-grafico__eixo" />
          <path d={trem} className="tf-grafico__linha" />
          <text x="150" y="116" className="tf-grafico__rotulo" textAnchor="middle">
            um pulso a cada {numero.format(periodo)} ms
          </text>
        </svg>
        <figcaption className="tf-grafico__legenda">Trem de pulsos: {numero.format(frequenciaHz)} por segundo</figcaption>
      </figure>

      {rampas && <Envelope rampas={rampas} />}
    </div>
  )
}

function Envelope({ rampas }: { rampas: Rampas }) {
  const total = tempoOn(rampas) + rampas.repouso
  const escala = (s: number) => (280 * s) / total
  const x1 = 10 + escala(rampas.subida)
  const x2 = x1 + escala(rampas.plato)
  const x3 = x2 + escala(rampas.descida)
  return (
    <figure className="tf-grafico__item">
      <svg viewBox="0 0 300 120" className="tf-grafico__svg">
        <line x1="0" y1="95" x2="300" y2="95" className="tf-grafico__eixo" />
        <path d={`M10 95 L${x1} 25 H${x2} L${x3} 95 H290`} className="tf-grafico__linha" />
        <text x={(x1 + x2) / 2} y="16" className="tf-grafico__rotulo" textAnchor="middle">
          platô {numero.format(rampas.plato)} s
        </text>
        <text x={(x3 + 290) / 2} y="112" className="tf-grafico__rotulo" textAnchor="middle">
          repouso {numero.format(rampas.repouso)} s
        </text>
      </svg>
      <figcaption className="tf-grafico__legenda">Um ciclo: subida, platô, descida e repouso</figcaption>
    </figure>
  )
}
