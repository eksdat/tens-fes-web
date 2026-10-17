/**
 * Contas do simulador (guia técnico, seções 12 e 13), sem interface. Os valores são didáticos: nada aqui é prescrição.
 * Largura de pulso segue o manual do Neurodyn: é a duração de cada fase (T) de um pulso bifásico simétrico.
 */

export type Faixa = { minimo: number; maximo: number }
export type FaixasDoCampo = { educativa?: Faixa; aparelho?: Faixa }
export type Classificacao = 'dentro' | 'fora-educativa' | 'fora-aparelho'
export type Rampas = { subida: number; plato: number; descida: number; repouso: number }

export type TipoMensagem = 'unidade' | 'fora-aparelho' | 'fora-educativa' | 'informacao-ausente'
export type Mensagem = { tipo: TipoMensagem; texto: string }

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const fmt = (valor: number) => numero.format(valor)

export const periodoMs = (frequenciaHz: number) => 1000 / frequenciaHz

/** Q = I × t, com mA e µs: o resultado sai em microcoulombs. */
export const cargaFaseMicroC = (intensidadeMa: number, faseUs: number) => (intensidadeMa * faseUs) / 1000

/** No simulador, o ON inclui subida, platô e descida (guia, seção 12). */
export const tempoOn = ({ subida, plato, descida }: Omit<Rampas, 'repouso'>) => subida + plato + descida

export const ciclo = (onS: number, offS: number) => onS + offS

export const cicloTrabalho = (onS: number, offS: number) => (onS / (onS + offS)) * 100

export const duracaoTotal = (cicloS: number, repeticoes: number) => cicloS * repeticoes

const fora = (valor: number, faixa: Faixa) => valor < faixa.minimo || valor > faixa.maximo

export function classificarValor(valor: number, faixas: FaixasDoCampo): Classificacao {
  if (faixas.aparelho && fora(valor, faixas.aparelho)) return 'fora-aparelho'
  if (faixas.educativa && fora(valor, faixas.educativa)) return 'fora-educativa'
  return 'dentro'
}

export const limitarAoAparelho = (valor: number, aparelho: Faixa) => Math.min(aparelho.maximo, Math.max(aparelho.minimo, valor))

/** 2000 "µs" num aparelho que vai até 500 µs quase sempre é alguém pensando em milissegundos (guia, seção 12). */
export const pareceMilissegundos = (valorUs: number, aparelho: Faixa) => valorUs > aparelho.maximo && valorUs >= 1000

export function mensagensDeSituacao({
  campo,
  valor,
  faixas,
}: {
  campo: string
  valor: number | null
  faixas: FaixasDoCampo
}): Mensagem[] {
  if (valor === null || Number.isNaN(valor)) {
    return [{ tipo: 'informacao-ausente', texto: 'Ainda faltam dados para discutir essa escolha com segurança.' }]
  }
  const mensagens: Mensagem[] = []
  if (campo === 'largura' && faixas.aparelho && pareceMilissegundos(valor, faixas.aparelho)) {
    mensagens.push({ tipo: 'unidade', texto: 'Confira a unidade: este campo usa microssegundos (µs).' })
  }
  const classificacao = classificarValor(valor, faixas)
  if (classificacao === 'fora-aparelho') {
    mensagens.push({ tipo: 'fora-aparelho', texto: 'O valor está fora da faixa documentada para o aparelho selecionado.' })
  } else if (classificacao === 'fora-educativa') {
    mensagens.push({
      tipo: 'fora-educativa',
      texto: 'O valor está fora da faixa educativa deste modo. Revise o objetivo antes de seguir.',
    })
  }
  return mensagens
}

export type EstadoPulso = {
  modalidade: string
  modo: string
  frequenciaHz: number
  larguraUs: number
  intensidadeMa: [number, number]
  rampas?: Rampas
  forma?: 'continuo' | 'burst' | 'sincrono' | 'reciproco'
}

export function descreverPulso({ modalidade, modo, frequenciaHz, larguraUs, intensidadeMa, rampas, forma = 'continuo' }: EstadoPulso): string {
  const modoDito = modo.startsWith(modalidade) ? modo : `${modalidade}, modo ${modo}`
  const partes = [
    `${modoDito}.`,
    `Pulso bifásico quadrático simétrico: cada fase dura ${fmt(larguraUs)} microssegundos, e o pulso completo, ${fmt(2 * larguraUs)} microssegundos.`,
    forma === 'burst'
      ? 'Rajadas de pulsos a 250 hertz, 2 rajadas por segundo. O desenho usa 7 pulsos por rajada, como esquema.'
      : `${fmt(frequenciaHz)} pulsos por segundo, um a cada ${fmt(periodoMs(frequenciaHz))} milissegundos.`,
  ]
  if (forma === 'sincrono') partes.push('Modo síncrono: os dois canais estimulam juntos.')
  if (forma === 'reciproco') partes.push('Modo recíproco: os canais alternam; o canal 2 começa quando o estímulo do canal 1 termina.')
  if (intensidadeMa.every((i) => i === 0)) {
    partes.push('Intensidade em zero nos dois canais: não há estimulação.')
  } else {
    partes.push(`Intensidade: canal 1, ${fmt(intensidadeMa[0])} miliampères; canal 2, ${fmt(intensidadeMa[1])} miliampères.`)
    intensidadeMa.forEach((i, canal) => {
      if (i > 0) partes.push(`Carga por fase no canal ${canal + 1}: ${fmt(cargaFaseMicroC(i, larguraUs))} microcoulombs.`)
    })
  }
  if (rampas) {
    const on = tempoOn(rampas)
    partes.push(
      `Ciclo: subida de ${fmt(rampas.subida)} segundos, platô de ${fmt(rampas.plato)} segundos, descida de ${fmt(rampas.descida)} segundos e repouso de ${fmt(rampas.repouso)} segundos.`,
      `Isso dá estímulo (ON) de ${fmt(on)} segundos, ciclo de ${fmt(ciclo(on, rampas.repouso))} segundos e ciclo de trabalho de ${fmt(cicloTrabalho(on, rampas.repouso))}%.`,
    )
  }
  return partes.join(' ')
}
