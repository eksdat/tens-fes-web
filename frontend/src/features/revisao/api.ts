import axios from 'axios'
import { api } from '../../shared/api/client'
import type { Anexo, LinkAnexo } from '../material/api'
import type { Bloco, PaginaTecnicaApi } from '../modulo/usePaginaTecnica'

export type EstadoEditorial = 'RASCUNHO' | 'EM_REVISAO' | 'APROVADO' | 'ARQUIVADO'

/** RevisaoConteudoResponse do backend. */
export type ConteudoEmRevisao = {
  id: number
  titulo: string
  modalidade: PaginaTecnicaApi['modalidade']
  secao: PaginaTecnicaApi['secao']
  /** Nulo quando o texto não é um dos cinco blocos da página técnica. */
  bloco: Bloco | null
  corpo: string
  referencias: string | null
  versao: number
  estado: EstadoEditorial
  /** ISO (aaaa-mm-dd), preenchida ao aprovar. */
  dataRevisao: string | null
  motivoDevolucao: string | null
  /** Material de estudo escrito na tela "Criar conteúdo" (os textos do guia não têm autor). */
  material: boolean
  anexos: Anexo[]
}

export const CHAVE_REVISAO = ['revisao', 'conteudos'] as const

export const ROTULO_SECAO: Record<ConteudoEmRevisao['secao'], string> = {
  VISAO_GERAL: 'Visão geral',
  APARELHO: 'Aparelho',
  ELETRODOS: 'Eletrodos',
  PARAMETROS: 'Parâmetros',
  SEGURANCA: 'Segurança',
  CASOS: 'Casos',
}

export const ROTULO_BLOCO: Record<Bloco, string> = {
  O_QUE_E: 'O que é',
  PARA_QUE_SERVE: 'Para que serve',
  COMO_INTERPRETAR: 'Como interpretar',
  EXEMPLO: 'Exemplo',
  CUIDADOS: 'Cuidados',
}

export async function listarEmRevisao(): Promise<ConteudoEmRevisao[]> {
  return (await api.get<ConteudoEmRevisao[]>('/revisao/conteudos')).data
}

export async function aprovarConteudo(id: number): Promise<ConteudoEmRevisao> {
  return (await api.post<ConteudoEmRevisao>(`/revisao/conteudos/${id}/aprovar`)).data
}

export async function devolverConteudo(id: number, motivo: string): Promise<ConteudoEmRevisao> {
  return (await api.post<ConteudoEmRevisao>(`/revisao/conteudos/${id}/devolver`, { motivo })).data
}

export async function linkDoAnexoEmRevisao(id: number, anexoId: string): Promise<LinkAnexo> {
  return (await api.get<LinkAnexo>(`/revisao/conteudos/${id}/anexos/${anexoId}/link`)).data
}

/** 409: outra pessoa decidiu este texto antes (a API trava a linha e só a primeira decisão vale). */
export function jaFoiDecidido(erro: unknown): boolean {
  return axios.isAxiosError(erro) && erro.response?.status === 409
}

/** 400 (motivo inválido ou texto sem fonte) e 403 (autor revisando o próprio texto) trazem a explicação. */
export function lerErroRevisao(erro: unknown): string {
  if (axios.isAxiosError(erro) && erro.response) {
    const dados = erro.response.data as { detail?: string; erros?: Record<string, string> } | undefined
    if (erro.response.status === 400) {
      return dados?.erros?.motivo ?? dados?.erros?.referencias ?? 'Confira o motivo da devolução.'
    }
    if ([403, 404, 409].includes(erro.response.status) && dados?.detail) return dados.detail
  }
  return 'Não foi possível salvar a revisão agora. Tente de novo em instantes.'
}
