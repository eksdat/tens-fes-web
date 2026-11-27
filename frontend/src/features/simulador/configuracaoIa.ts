import type { Modalidade } from './api'

export const CAMPOS_SIMULADOR = [
  { id: 'frequencia', rotulo: 'Frequência', parametro: 'Frequência', unidade: 'Hz' },
  { id: 'largura', rotulo: 'Largura de pulso', parametro: 'Largura de pulso', unidade: 'µs' },
  { id: 'intensidade1', rotulo: 'Intensidade do canal 1', parametro: 'Intensidade', unidade: 'mA' },
  { id: 'intensidade2', rotulo: 'Intensidade do canal 2', parametro: 'Intensidade', unidade: 'mA' },
  { id: 'subida', rotulo: 'Rampa de subida', parametro: 'Rampa de subida', unidade: 's', soFes: true },
  { id: 'plato', rotulo: 'Platô', parametro: 'Platô', unidade: 's', soFes: true },
  { id: 'descida', rotulo: 'Rampa de descida', parametro: 'Rampa de descida', unidade: 's', soFes: true },
  { id: 'repouso', rotulo: 'Repouso', parametro: 'Repouso (tempo OFF)', unidade: 's', soFes: true },
] as const

export type CampoSimulador = typeof CAMPOS_SIMULADOR[number]
export const camposConfiguracaoIa = CAMPOS_SIMULADOR.filter(({ id }) => id !== 'intensidade1' && id !== 'intensidade2')

export type ConfiguracaoIa = {
  modalidade: Modalidade
  modo: string
  valores: Partial<Record<typeof camposConfiguracaoIa[number]['id'], number>>
}
