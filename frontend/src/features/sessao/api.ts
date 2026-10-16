import { api } from '../../shared/api/client'
import type { Lado } from '../avaliacao/api'

export type Modalidade = 'TENS' | 'NMES' | 'FES'

export type Canal = {
  canal: 1 | 2
  frequenciaHz: number
  larguraPulsoUs: number
  amplitudeInicialMa: number | null
  amplitudeFinalMa: number
  par: string
}

export type SessaoRequest = {
  dataHora: string
  objetivo: string
  modalidade: Modalidade
  aparelho: string
  modo: string | null
  duracaoRealMin: number
  canais: Canal[]
  eletrodoTipo: string
  eletrodoDimensoes: string
  lado: Lado
  marcos: string
  montagemId: string | null
  sensacao: string | null
  contracao: string | null
  tolerancia: string | null
  fadiga: string | null
  ajustes: string | null
  medidaAntes: string | null
  medidaDepois: string | null
  medidaContexto: string | null
  condicaoPele: string
  motivoTermino: string
  planoReavaliacao: string
  checklist: string[]
}

export type Sessao = SessaoRequest & { id: string; pacienteId: string; profissionalId: string; criadoEm: string }

export const chaveSessoes = (pacienteId: string) => ['pacientes', pacienteId, 'sessoes'] as const

export async function listarSessoes(pacienteId: string): Promise<Sessao[]> {
  return (await api.get<Sessao[]>(`/pacientes/${pacienteId}/sessoes`)).data
}

export async function registrarSessao(pacienteId: string, corpo: SessaoRequest): Promise<Sessao> {
  return (await api.post<Sessao>(`/pacientes/${pacienteId}/sessoes`, corpo)).data
}
