import type { Usuario } from '../features/usuario/useUsuarioAtual'

export type Aba = { rotulo: string; para: string; perfil?: Usuario['perfil'] }

/** Nomes, ordem e posição nunca mudam entre telas (Card 22). */
export const ABAS: Aba[] = [
  { rotulo: 'Início', para: '/' },
  { rotulo: 'TENS', para: '/tens' },
  { rotulo: 'FES', para: '/fes' },
  { rotulo: 'Criar conteúdo', para: '/criar-conteudo' },
  { rotulo: 'Pacientes', para: '/pacientes', perfil: 'PROFISSIONAL' },
]
