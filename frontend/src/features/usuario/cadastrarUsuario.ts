import axios from 'axios'
import { api } from '../../shared/api/client'
import type { CadastroRequest } from '../auth/cadastro'
import type { Usuario } from './useUsuarioAtual'

export async function cadastrarUsuario(corpo: CadastroRequest): Promise<Usuario> {
  const resposta = await api.post<Usuario>('/usuarios/me', corpo)
  return resposta.data
}

export type ErroDeCadastro = {
  /** 409: o cadastro já existe. */
  jaCadastrado: boolean
  mensagem: string
  /** Erro por campo da API (ProblemDetail.erros), pelos nomes do CadastroRequest. */
  campos: Record<string, string>
}

export function lerErroDeCadastro(erro: unknown): ErroDeCadastro {
  if (axios.isAxiosError(erro)) {
    if (erro.response?.status === 409) return { jaCadastrado: true, mensagem: '', campos: {} }
    if (erro.response?.status === 400) {
      const dados = erro.response.data as { detail?: string; erros?: Record<string, string> } | undefined
      return { jaCadastrado: false, mensagem: dados?.detail ?? 'Confira os dados informados.', campos: dados?.erros ?? {} }
    }
  }
  return {
    jaCadastrado: false,
    mensagem: 'Não foi possível concluir o cadastro agora. O servidor pode estar iniciando; tente de novo em instantes.',
    campos: {},
  }
}
