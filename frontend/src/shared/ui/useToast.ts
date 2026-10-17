import { createContext, useContext } from 'react'

export type TipoToast = 'sucesso' | 'info' | 'atencao' | 'erro'

export type NovoToast = {
  tipo: TipoToast
  /** Uma ou duas palavras sobre o que aconteceu. Nunca nome de paciente: a tela pode estar à vista na recepção. */
  titulo: string
  texto?: string
  acao?: { rotulo: string; aoClicar: () => void }
}

export type Toast = NovoToast & { id: number }

export type ToastsContextValue = {
  visiveis: Toast[]
  mostrar: (toast: NovoToast) => void
  fechar: (id: number) => void
}

export const ToastsContext = createContext<ToastsContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastsContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastsProvider>')
  return ctx
}
