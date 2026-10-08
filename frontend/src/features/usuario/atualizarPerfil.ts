import axios from 'axios'
import { api } from '../../shared/api/client'
import type { components } from '../../shared/api/schema'
import type { Usuario } from './useUsuarioAtual'

export type AtualizarPerfilProfissionalRequest = components['schemas']['AtualizarPerfilProfissionalRequest']

export async function atualizarPerfilProfissional(
  corpo: AtualizarPerfilProfissionalRequest
): Promise<Usuario> {
  const resposta = await api.put<Usuario>('/usuarios/me/perfil', corpo)
  return resposta.data
}

export type ErroAtualizacaoPerfil = {
  mensagem: string
  campos: Record<string, string>
}

export function lerErroAtualizacaoPerfil(erro: unknown): ErroAtualizacaoPerfil {
  if (axios.isAxiosError(erro)) {
    if (erro.response?.status === 400) {
      const dados = erro.response.data as { detail?: string; erros?: Record<string, string> } | undefined
      return {
        mensagem: dados?.detail ?? 'Confira os dados informados.',
        campos: dados?.erros ?? {},
      }
    }
  }
  return {
    mensagem: 'Não foi possível atualizar o perfil agora. Tente de novo em instantes.',
    campos: {},
  }
}
