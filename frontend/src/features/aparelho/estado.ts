import { createContext } from 'react'

/** O que o aparelho mostra agora. O simulador escreve; a lista de controles do aparelho lê. */
export type EstadoDoAparelho = {
  modalidade: 'TENS' | 'FES'
  modo: string
  frequenciaHz: number
  larguraUs: number
  intensidade1: number
  intensidade2: number
  emExecucao: boolean
}

/** Mesmo ponto de partida do simulador: TENS convencional (guia, seção 07), intensidade zero e simulação parada. */
export const ESTADO_INICIAL: EstadoDoAparelho = {
  modalidade: 'TENS',
  modo: 'Convencional',
  frequenciaHz: 80,
  larguraUs: 100,
  intensidade1: 0,
  intensidade2: 0,
  emExecucao: false,
}

export type ContextoDoAparelho = {
  estado: EstadoDoAparelho
  atualizar: (parcial: Partial<EstadoDoAparelho>) => void
}

/** Sem provedor (testes, telas isoladas) vale o estado inicial e nada é guardado. */
export const ContextoDoAparelhoPadrao: ContextoDoAparelho = { estado: ESTADO_INICIAL, atualizar: () => {} }

export const ContextoDoAparelhoReact = createContext<ContextoDoAparelho>(ContextoDoAparelhoPadrao)
