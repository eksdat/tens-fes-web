import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '../../shared/api/client'
import type { components } from '../../shared/api/schema'
import { useAuth } from '../../shared/auth/useAuth'

export type Usuario = components['schemas']['UsuarioResponse']

export const CHAVE_USUARIO_ATUAL = ['usuario', 'me'] as const

export const ROTULO_PERFIL: Record<Usuario['perfil'], string> = { ESTUDANTE: 'Estudante', PROFISSIONAL: 'Profissional' }

/**
 * Usuário logado, vindo da API. `data === null` significa "autenticado no Supabase, mas sem cadastro completo"
 * (a API responde 404): o usuário precisa completar o cadastro.
 */
export function useUsuarioAtual() {
  const { sessao } = useAuth()

  return useQuery({
    queryKey: CHAVE_USUARIO_ATUAL,
    enabled: !!sessao,
    retry: false,
    queryFn: async (): Promise<Usuario | null> => {
      try {
        const resposta = await api.get<Usuario>('/usuarios/me')
        return resposta.data
      } catch (erro) {
        if (axios.isAxiosError(erro) && erro.response?.status === 404) return null
        throw erro
      }
    },
  })
}
