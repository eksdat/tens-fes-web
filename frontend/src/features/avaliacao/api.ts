import { api } from '../../shared/api/client'

export type EstadoAchado = 'NAO_AVALIADO' | 'AUSENTE' | 'PRESENTE'
export type ItemTriagem =
  | 'DISPOSITIVO_IMPLANTADO'
  | 'GESTACAO'
  | 'SUSPEITA_TROMBOSE'
  | 'INFECCAO'
  | 'ALTERACAO_PELE_SENSIBILIDADE'
  | 'RESTRICOES'
export type BlocoAchado = 'PELE_SENSIBILIDADE' | 'FUNCAO_MOTORA'
export type Lado = 'ESQUERDO' | 'DIREITO' | 'BILATERAL' | 'NAO_SE_APLICA'

export type Achado = {
  bloco: BlocoAchado
  descricao: string
  estado: EstadoAchado
  lado: Lado
  regiao: string
  metodo: string
}

export type AvaliacaoRequest = {
  dataAvaliacao: string
  queixa: string | null
  historico: string | null
  dorEscala: number | null
  dorContexto: string | null
  dorTarefa: string | null
  dorMomento: string | null
  objetivo: string | null
  plano: string | null
  triagem: Record<ItemTriagem, EstadoAchado>
  achados: Achado[]
}

export type Avaliacao = AvaliacaoRequest & {
  id: string
  pacienteId: string
  criadoEm: string
  criadoPor: string
  alteradoEm: string
  alteradoPor: string
}

/** Itens do guia, seção 17, na ordem da tela. */
export const ITENS_TRIAGEM: { item: ItemTriagem; rotulo: string }[] = [
  { item: 'DISPOSITIVO_IMPLANTADO', rotulo: 'Dispositivo eletrônico implantado' },
  { item: 'GESTACAO', rotulo: 'Gestação' },
  { item: 'SUSPEITA_TROMBOSE', rotulo: 'Suspeita de trombose' },
  { item: 'INFECCAO', rotulo: 'Infecção' },
  { item: 'ALTERACAO_PELE_SENSIBILIDADE', rotulo: 'Alteração de pele ou sensibilidade' },
  { item: 'RESTRICOES', rotulo: 'Restrições' },
]

export const ROTULO_ESTADO: Record<EstadoAchado, string> = {
  NAO_AVALIADO: 'Não avaliado',
  AUSENTE: 'Ausente',
  PRESENTE: 'Presente',
}

export const ROTULO_LADO: Record<Lado, string> = {
  ESQUERDO: 'Esquerdo',
  DIREITO: 'Direito',
  BILATERAL: 'Bilateral',
  NAO_SE_APLICA: 'Não se aplica',
}

export const chaveAvaliacoes = (pacienteId: string) => ['pacientes', pacienteId, 'avaliacoes'] as const

export async function listarAvaliacoes(pacienteId: string, direcao: 'asc' | 'desc'): Promise<Avaliacao[]> {
  return (await api.get<Avaliacao[]>(`/pacientes/${pacienteId}/avaliacoes`, { params: { direcao } })).data
}

export async function buscarAvaliacao(pacienteId: string, id: string): Promise<Avaliacao> {
  return (await api.get<Avaliacao>(`/pacientes/${pacienteId}/avaliacoes/${id}`)).data
}

export async function criarAvaliacao(pacienteId: string, corpo: AvaliacaoRequest): Promise<Avaliacao> {
  return (await api.post<Avaliacao>(`/pacientes/${pacienteId}/avaliacoes`, corpo)).data
}

export async function atualizarAvaliacao(pacienteId: string, id: string, corpo: AvaliacaoRequest): Promise<Avaliacao> {
  return (await api.put<Avaliacao>(`/pacientes/${pacienteId}/avaliacoes/${id}`, corpo)).data
}
