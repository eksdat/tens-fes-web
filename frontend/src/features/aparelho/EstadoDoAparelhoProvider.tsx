import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ContextoDoAparelhoReact, ESTADO_INICIAL, type EstadoDoAparelho } from './estado'

/** Guarda o estado do aparelho na memória enquanto o app está aberto: sair do simulador e voltar não zera o que foi ajustado. */
export function EstadoDoAparelhoProvider({ inicial = ESTADO_INICIAL, children }: { inicial?: EstadoDoAparelho; children: ReactNode }) {
  const [estado, setEstado] = useState(inicial)
  const atualizar = useCallback((parcial: Partial<EstadoDoAparelho>) => {
    setEstado((atual) => {
      const mudou = (Object.keys(parcial) as (keyof EstadoDoAparelho)[]).some((k) => atual[k] !== parcial[k])
      return mudou ? { ...atual, ...parcial } : atual
    })
  }, [])
  const valor = useMemo(() => ({ estado, atualizar }), [estado, atualizar])
  return <ContextoDoAparelhoReact value={valor}>{children}</ContextoDoAparelhoReact>
}
