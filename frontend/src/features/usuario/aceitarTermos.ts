import { api } from '../../shared/api/client'
import type { Usuario } from './useUsuarioAtual'

export async function aceitarTermos(): Promise<Usuario> {
  return (await api.post<Usuario>('/usuarios/me/termos', { aceite: true })).data
}
