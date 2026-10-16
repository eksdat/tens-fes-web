import { periodoMs, type Rampas } from './calculos'
import { OsciloscopioAoVivo } from './OsciloscopioAoVivo'

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

type Props = { frequenciaHz: number; larguraUs: number; rampas?: Rampas; intensidades: [number, number]; emExecucao: boolean }

/**
 * Osciloscópio ao vivo e, abaixo, os desenhos parados de um pulso e do trem, sem escala de intensidade: forma quadrática simétrica bifásica (manual do Neurodyn, cap. 8.2.4).
 * Os desenhos são decorativos para o leitor de tela; a tabela e a descrição ao lado trazem os mesmos valores.
 */
export function GraficoPulso({ frequenciaHz, larguraUs, rampas, intensidades, emExecucao }: Props) {
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
    <div className="tf-grafico">
      <OsciloscopioAoVivo
        frequenciaHz={frequenciaHz}
        larguraUs={larguraUs}
        intensidades={intensidades}
        rampas={rampas}
        emExecucao={emExecucao}
      />

      <figure className="tf-grafico__item" aria-hidden="true">
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

      <figure className="tf-grafico__item" aria-hidden="true">
        <svg viewBox="0 0 300 120" className="tf-grafico__svg">
          <line x1="0" y1="60" x2="300" y2="60" className="tf-grafico__eixo" />
          <path d={trem} className="tf-grafico__linha" />
          <text x="150" y="116" className="tf-grafico__rotulo" textAnchor="middle">
            um pulso a cada {numero.format(periodo)} ms
          </text>
        </svg>
        <figcaption className="tf-grafico__legenda">Trem de pulsos: {numero.format(frequenciaHz)} por segundo</figcaption>
      </figure>

    </div>
  )
}

