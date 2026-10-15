import type { Usuario } from '../features/usuario/useUsuarioAtual'
import { ABAS } from './abas'

export type Atalho = {
  rotulo: string
  grupo: 'Módulos' | 'Ações'
  /** Rota de destino. Sem rota, o atalho é a ação de sair. */
  para?: string
  perfil?: Usuario['perfil']
  /** Termos extras que também encontram o atalho. */
  palavras?: string
}

/** Ação só entra aqui quando existe de verdade; módulos novos acrescentam as suas. */
const ACOES: Atalho[] = [
  { rotulo: 'Meu perfil', grupo: 'Ações', para: '/perfil', palavras: 'conta dados' },
  { rotulo: 'Sair', grupo: 'Ações', palavras: 'logout encerrar sessão' },
]

export function atalhosDoPerfil(perfil: Usuario['perfil'] | undefined): Atalho[] {
  const modulos = ABAS.map<Atalho>(({ rotulo, para, perfil }) => ({ rotulo, grupo: 'Módulos', para, perfil }))
  return [...modulos, ...ACOES].filter((a) => !a.perfil || a.perfil === perfil)
}

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function filtrarAtalhos(atalhos: Atalho[], consulta: string): Atalho[] {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (termos.length === 0) return atalhos
  return atalhos.filter((a) => {
    const alvo = normalizar(`${a.rotulo} ${a.palavras ?? ''}`)
    return termos.every((t) => alvo.includes(t))
  })
}
