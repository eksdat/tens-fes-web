import axios from 'axios'
import { api } from '../../shared/api/client'
import type { PaginaTecnicaApi } from '../modulo/usePaginaTecnica'
import type { EstadoEditorial } from '../revisao/api'

export type TipoAnexo = 'PDF' | 'PNG' | 'JPEG'

/** AnexoResponse do backend. O arquivo só abre pelo link temporário (linkDoAnexo). */
export type Anexo = {
  id: string
  nome: string
  tipo: TipoAnexo
  tamanhoBytes: number
  criadoEm: string
}

/** MaterialRequest do backend. "secao" é o tema: a aba do módulo onde o material se encaixa. */
export type MaterialRequest = {
  titulo: string
  modalidade: PaginaTecnicaApi['modalidade']
  secao: PaginaTecnicaApi['secao']
  corpo: string
  referencias: string | null
}

export type Material = MaterialRequest & {
  id: number
  estado: EstadoEditorial
  /** Preenchido em RASCUNHO quando o revisor devolveu. */
  motivoDevolucao: string | null
  dataRevisao: string | null
  anexos: Anexo[]
  criadoEm: string
  atualizadoEm: string
}

export type LinkAnexo = { url: string; expiraEm: string }

/** Textos do card e do guia técnico (seção 03), mostrados no formulário. */
export const AVISOS = {
  validacao: 'Publicar um anexo não equivale a validá-lo clinicamente.',
  prontuario: 'Não anexe prontuários ou dados de pacientes reais.',
}

/** Mesmos limites do backend (AnexoService); lá o tipo ainda é conferido pelos bytes do arquivo. */
export const LIMITE_ANEXO_BYTES = 10 * 1024 * 1024
export const MAXIMO_ANEXOS = 5
export const TIPOS_ACEITOS = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg'
const EXTENSOES = /\.(pdf|png|jpe?g)$/i

export const ROTULO_ESTADO: Record<EstadoEditorial, string> = {
  RASCUNHO: 'Rascunho',
  EM_REVISAO: 'Em revisão',
  APROVADO: 'Aprovado',
  ARQUIVADO: 'Arquivado',
}

export const CHAVE_MATERIAIS = ['materiais'] as const

/** Rascunho devolvido pela revisão aparece como "Devolvido", para o autor achar o que precisa ajustar. */
export function rotuloDoEstado(material: Pick<Material, 'estado' | 'motivoDevolucao'>) {
  return material.estado === 'RASCUNHO' && material.motivoDevolucao ? 'Devolvido' : ROTULO_ESTADO[material.estado]
}

export async function listarMateriais(): Promise<Material[]> {
  return (await api.get<Material[]>('/materiais')).data
}

export async function buscarMaterial(id: number): Promise<Material> {
  return (await api.get<Material>(`/materiais/${id}`)).data
}

export async function criarMaterial(corpo: MaterialRequest): Promise<Material> {
  return (await api.post<Material>('/materiais', corpo)).data
}

export async function alterarMaterial(id: number, corpo: MaterialRequest): Promise<Material> {
  return (await api.put<Material>(`/materiais/${id}`, corpo)).data
}

export async function excluirMaterial(id: number): Promise<void> {
  await api.delete(`/materiais/${id}`)
}

export async function enviarParaRevisao(id: number): Promise<Material> {
  return (await api.post<Material>(`/materiais/${id}/enviar`)).data
}

export async function anexarArquivo(id: number, arquivo: File): Promise<Anexo> {
  const formulario = new FormData()
  formulario.append('arquivo', arquivo)
  return (await api.post<Anexo>(`/materiais/${id}/anexos`, formulario)).data
}

export async function removerAnexo(id: number, anexoId: string): Promise<void> {
  await api.delete(`/materiais/${id}/anexos/${anexoId}`)
}

export async function linkDoAnexo(id: number, anexoId: string): Promise<LinkAnexo> {
  return (await api.get<LinkAnexo>(`/materiais/${id}/anexos/${anexoId}/link`)).data
}

/** Confere antes de enviar, para não esperar o upload de um arquivo que o servidor vai recusar. */
export function conferirArquivo(arquivo: File): string | null {
  if (!EXTENSOES.test(arquivo.name)) return 'Envie um PDF ou uma imagem PNG ou JPEG.'
  if (arquivo.size === 0) return 'O arquivo está vazio.'
  if (arquivo.size > LIMITE_ANEXO_BYTES) return 'O arquivo passa de 10 MB.'
  return null
}

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${numero.format(bytes / 1024)} kB`
  return `${numero.format(bytes / (1024 * 1024))} MB`
}

/** 404 é resposta, não falha de rede: repetir só atrasa o "Material não encontrado". */
export function repetirSeNaoFor404(falhas: number, erro: unknown) {
  return !(axios.isAxiosError(erro) && erro.response?.status === 404) && falhas < 3
}

export type ErroMaterial = { mensagem: string; campos: Record<string, string> }

/** 400 traz erros por campo; 404, 409 e 503 trazem a explicação no "detail". */
export function lerErroMaterial(erro: unknown): ErroMaterial {
  if (axios.isAxiosError(erro) && erro.response) {
    const dados = erro.response.data as { detail?: string; erros?: Record<string, string> } | undefined
    if (erro.response.status === 400) return { mensagem: 'Confira os campos destacados.', campos: dados?.erros ?? {} }
    if (erro.response.status === 413) return { mensagem: 'O arquivo passa de 10 MB.', campos: {} }
    if ([404, 409, 503].includes(erro.response.status) && dados?.detail) return { mensagem: dados.detail, campos: {} }
  }
  return { mensagem: 'Não foi possível salvar agora. Tente de novo em instantes.', campos: {} }
}
