import type { Rampas } from './calculos'

/** Intensidade que enche a altura do traçado: o máximo do aparelho de referência (manual do Neurodyn, 0 a 100 mA). */
export const INTENSIDADE_MAXIMA_MA = 100

const PERIODOS_NA_JANELA = 6
/** Tempo que um pulso leva para atravessar a tela; abaixo disso o olho não acompanha. */
const TRAVESSIA_MS = 3000

export type Fase = 'Subida' | 'Platô' | 'Descida' | 'Repouso'
export type Envelope = { fase: Fase; nivel: number; decorridoS: number; duracaoS: number; posicao: number }

/** Onde o ciclo do FES está no tempo real `tS`: fase, nível da rampa (0 a 1) e quanto da fase já passou. */
export function envelopeEm(tS: number, r: Rampas): Envelope {
  const total = r.subida + r.plato + r.descida + r.repouso
  const t = ((tS % total) + total) % total
  const posicao = t / total
  if (t < r.subida) return { fase: 'Subida', nivel: t / r.subida, decorridoS: t, duracaoS: r.subida, posicao }
  if (t < r.subida + r.plato) return { fase: 'Platô', nivel: 1, decorridoS: t - r.subida, duracaoS: r.plato, posicao }
  const fimDescida = r.subida + r.plato + r.descida
  if (t < fimDescida) {
    const d = t - r.subida - r.plato
    return { fase: 'Descida', nivel: 1 - d / r.descida, decorridoS: d, duracaoS: r.descida, posicao }
  }
  return { fase: 'Repouso', nivel: 0, decorridoS: t - fimDescida, duracaoS: r.repouso, posicao }
}

/**
 * A janela mostra seis períodos. Se eles passariam rápido demais, o tempo do desenho desacelera ("câmera lenta");
 * nunca acelera: pulso lento roda em tempo real.
 */
export function escalaDeTempo(frequenciaHz: number) {
  const janelaMs = (1000 / frequenciaHz) * PERIODOS_NA_JANELA
  return { janelaMs, lentidao: Math.max(1, TRAVESSIA_MS / janelaMs) }
}

type Tracado = {
  frequenciaHz: number
  larguraUs: number
  intensidadeMa: number
  /** Tempo simulado na borda esquerda da janela. */
  inicioMs: number
  largura: number
  altura: number
}

const arredondar = (n: number) => Math.round(n * 10) / 10

/** Pulso bifásico quadrático simétrico (manual, cap. 8.2.4): sobe, desce do mesmo tanto, volta à linha de base. */
export function caminhoDoTracado({ frequenciaHz, larguraUs, intensidadeMa, inicioMs, largura, altura }: Tracado): string {
  const meio = altura / 2
  const amplitude = (Math.min(intensidadeMa, INTENSIDADE_MAXIMA_MA) / INTENSIDADE_MAXIMA_MA) * (meio - 4)
  if (amplitude <= 0) return `M0 ${meio} H${largura}`

  const { janelaMs } = escalaDeTempo(frequenciaHz)
  const periodoMs = 1000 / frequenciaHz
  const faseMs = larguraUs / 1000
  const x = (ms: number) => arredondar(((ms - inicioMs) / janelaMs) * largura)
  // Mínimo de 1,5 unidade por fase: 100 µs num período de 12,5 ms some na tela.
  const larguraFase = Math.max(1.5, (faseMs / janelaMs) * largura)
  const topo = arredondar(meio - amplitude)
  const fundo = arredondar(meio + amplitude)

  const partes = [`M0 ${meio}`]
  const primeiro = Math.ceil(inicioMs / periodoMs)
  for (let k = primeiro; k * periodoMs < inicioMs + janelaMs; k++) {
    const x0 = x(k * periodoMs)
    partes.push(`H${x0}`, `V${topo}`, `H${arredondar(x0 + larguraFase)}`, `V${fundo}`, `H${arredondar(x0 + 2 * larguraFase)}`, `V${meio}`)
  }
  partes.push(`H${largura}`)
  return partes.join(' ')
}
