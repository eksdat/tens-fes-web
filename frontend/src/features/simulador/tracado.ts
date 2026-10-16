import type { FaixasDoCampo, Rampas } from './calculos'

/** Intensidade que enche a altura do traçado: o máximo do aparelho de referência (manual do Neurodyn, 0 a 100 mA). */
export const INTENSIDADE_MAXIMA_MA = 100

const PERIODOS_NA_JANELA = 6
/** Tempo que um pulso leva para atravessar a tela; abaixo disso o olho não acompanha. */
const TRAVESSIA_MS = 3000

/**
 * Como os pulsos se distribuem no tempo. Contínuo: um pulso a cada período (TENS convencional, acupuntura, normal e
 * FES). Burst: pulsos agrupados em rajadas. Síncrono e recíproco: FES com os dois canais juntos ou alternados.
 */
export type Forma = 'continuo' | 'burst' | 'sincrono' | 'reciproco'

/**
 * TENS Burst do Neurodyn (manual, cap. 8.2.4): rajadas de 250 Hz moduladas a 2 Hz. O manual não diz quantos pulsos há
 * em cada rajada; 7 é um esquema didático, dito na tela.
 */
export const BURST = { frequenciaInternaHz: 250, rajadasPorSegundo: 2, pulsosPorRajada: 7 } as const

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
 * No recíproco o canal 2 começa quando o estímulo (ON) do canal 1 termina: um contrai enquanto o outro descansa
 * (manual, cap. 8.2.5, modos FES Sinc e FES Rec). No síncrono os dois seguem o mesmo ciclo.
 */
export function envelopeDoCanal(tS: number, r: Rampas, canal: 1 | 2, forma: Forma): Envelope {
  const atraso = forma === 'reciproco' && canal === 2 ? r.subida + r.plato + r.descida : 0
  return envelopeEm(tS - atraso, r)
}

/**
 * A janela mostra seis períodos. Se eles passariam rápido demais, o tempo do desenho desacelera ("câmera lenta");
 * nunca acelera: pulso lento roda em tempo real. No burst a janela é de duas rajadas, em tempo real.
 */
export function escalaDeTempo(frequenciaHz: number, forma: Forma = 'continuo') {
  if (forma === 'burst') return { janelaMs: (1000 / BURST.rajadasPorSegundo) * 2, lentidao: 1 }
  const janelaMs = (1000 / frequenciaHz) * PERIODOS_NA_JANELA
  return { janelaMs, lentidao: Math.max(1, TRAVESSIA_MS / janelaMs) }
}

/** Início de cada pulso dentro da janela [inicioMs, inicioMs + janelaMs). */
export function instantesDosPulsos({
  forma,
  frequenciaHz,
  inicioMs,
  janelaMs,
}: {
  forma: Forma
  frequenciaHz: number
  inicioMs: number
  janelaMs: number
}): number[] {
  const fim = inicioMs + janelaMs
  const instantes: number[] = []
  if (forma === 'burst') {
    const periodoRajada = 1000 / BURST.rajadasPorSegundo
    const intervalo = 1000 / BURST.frequenciaInternaHz
    for (let r = Math.floor(inicioMs / periodoRajada); r * periodoRajada < fim; r++) {
      for (let j = 0; j < BURST.pulsosPorRajada; j++) {
        const t = r * periodoRajada + j * intervalo
        if (t >= inicioMs && t < fim) instantes.push(t)
      }
    }
    return instantes
  }
  const periodo = 1000 / frequenciaHz
  for (let k = Math.ceil(inicioMs / periodo); k * periodo < fim; k++) instantes.push(k * periodo)
  return instantes
}

/** Meio da faixa educativa, preso ao que o aparelho aceita; sem faixa educativa, o meio da faixa do aparelho. */
export function valorInicialDoModo({ educativa, aparelho }: FaixasDoCampo): number | undefined {
  const base = educativa ?? aparelho
  if (!base) return undefined
  const meio = Math.round((base.minimo + base.maximo) / 2)
  return aparelho ? Math.min(aparelho.maximo, Math.max(aparelho.minimo, meio)) : meio
}

type Tracado = {
  frequenciaHz: number
  larguraUs: number
  intensidadeMa: number
  /** Tempo simulado na borda esquerda da janela. */
  inicioMs: number
  largura: number
  altura: number
  forma?: Forma
}

const arredondar = (n: number) => Math.round(n * 10) / 10

/** Pulso bifásico quadrático simétrico (manual, cap. 8.2.4): sobe, desce do mesmo tanto, volta à linha de base. */
export function caminhoDoTracado({ frequenciaHz, larguraUs, intensidadeMa, inicioMs, largura, altura, forma = 'continuo' }: Tracado): string {
  const meio = altura / 2
  const amplitude = (Math.min(intensidadeMa, INTENSIDADE_MAXIMA_MA) / INTENSIDADE_MAXIMA_MA) * (meio - 4)
  if (amplitude <= 0) return `M0 ${meio} H${largura}`

  const { janelaMs } = escalaDeTempo(frequenciaHz, forma)
  const faseMs = larguraUs / 1000
  const x = (ms: number) => arredondar(((ms - inicioMs) / janelaMs) * largura)
  // Mínimo de 1,5 unidade por fase: 100 µs num período de 12,5 ms some na tela.
  const larguraFase = Math.max(1.5, (faseMs / janelaMs) * largura)
  const topo = arredondar(meio - amplitude)
  const fundo = arredondar(meio + amplitude)

  const partes = [`M0 ${meio}`]
  for (const t of instantesDosPulsos({ forma, frequenciaHz, inicioMs, janelaMs })) {
    const x0 = x(t)
    partes.push(`H${x0}`, `V${topo}`, `H${arredondar(x0 + larguraFase)}`, `V${fundo}`, `H${arredondar(x0 + 2 * larguraFase)}`, `V${meio}`)
  }
  partes.push(`H${largura}`)
  return partes.join(' ')
}
