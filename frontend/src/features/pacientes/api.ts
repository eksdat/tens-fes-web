import axios from 'axios'
import { api } from '../../shared/api/client'

export type Paciente = {
  id: string
  nome: string
  sobrenome: string
  identificador: string
  email: string | null
  dataNascimento: string
  criadoEm: string
  criadoPor: string
  alteradoEm: string
  alteradoPor: string
}

export type PacienteRequest = Pick<
  Paciente,
  'nome' | 'sobrenome' | 'identificador' | 'dataNascimento'
> & { email: string | null }

export type Pagina<T> = { itens: T[]; pagina: number; tamanho: number; totalItens: number; totalPaginas: number }

/** Colunas que a API aceita ordenar (PacienteService.COLUNAS_ORDENAVEIS). */
export type ColunaOrdenavel = 'nome' | 'identificador' | 'dataNascimento' | 'alteradoEm'

export type FiltroPacientes = { busca: string; ordenar: ColunaOrdenavel; direcao: 'asc' | 'desc'; pagina: number }

export const CHAVE_PACIENTES = ['pacientes'] as const

export async function listarPacientes(filtro: FiltroPacientes): Promise<Pagina<Paciente>> {
  const { busca, ...resto } = filtro
  const resposta = await api.get<Pagina<Paciente>>('/pacientes', {
    params: { ...resto, ...(busca.trim() ? { busca: busca.trim() } : {}), tamanho: 20 },
  })
  return resposta.data
}

export async function buscarPaciente(id: string): Promise<Paciente> {
  return (await api.get<Paciente>(`/pacientes/${id}`)).data
}

export async function criarPaciente(corpo: PacienteRequest): Promise<Paciente> {
  return (await api.post<Paciente>('/pacientes', corpo)).data
}

export async function atualizarPaciente(id: string, corpo: PacienteRequest): Promise<Paciente> {
  return (await api.put<Paciente>(`/pacientes/${id}`, corpo)).data
}

export async function excluirPaciente(id: string): Promise<void> {
  await api.delete(`/pacientes/${id}`)
}

export type ErroPaciente = { mensagem: string; campos: Record<string, string> }

export function lerErroPaciente(erro: unknown): ErroPaciente {
  if (axios.isAxiosError(erro) && erro.response) {
    const dados = erro.response.data as { detail?: string; erros?: Record<string, string> } | undefined
    if (erro.response.status === 400) {
      return { mensagem: 'Confira os campos destacados.', campos: dados?.erros ?? {} }
    }
    if (erro.response.status === 409) {
      return { mensagem: dados?.detail ?? 'Identificador já usado.', campos: { identificador: dados?.detail ?? '' } }
    }
    if (erro.response.status === 404) {
      return { mensagem: 'Paciente não encontrado.', campos: {} }
    }
  }
  return { mensagem: 'Não foi possível salvar agora. Tente de novo em instantes.', campos: {} }
}
