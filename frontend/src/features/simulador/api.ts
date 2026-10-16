import { api } from '../../shared/api/client'

export type Modalidade = 'TENS' | 'FES'

/** Faixa de um parâmetro num modo: EDUCATIVA vem do guia técnico; APARELHO, do manual do Neurodyn. */
export type FaixaApi = {
  modalidade: string
  modo: string
  parametro: string
  unidade: string
  unidadeExtenso: string
  origem: 'EDUCATIVA' | 'APARELHO'
  minimo: number
  maximo: number
  fonte: string
}

export async function buscarFaixas(modalidade: Modalidade): Promise<FaixaApi[]> {
  const resposta = await api.get<FaixaApi[]>('/parametros/faixas', { params: { modalidade } })
  return resposta.data
}

