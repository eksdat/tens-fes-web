import { useRef, type PointerEvent } from 'react'

type Ponto = { x: number; y: number }
const distancia = (a: Ponto, b: Ponto) => Math.hypot(a.x - b.x, a.y - b.y)

export function useGestosVisuais({
  mover,
  aproximar,
  tocar,
}: {
  mover: (dx: number, dy: number) => void
  aproximar: (fator: number) => void
  tocar?: (x: number, y: number) => void
}) {
  const pontos = useRef(new Map<number, Ponto>())
  const inicio = useRef<Ponto | null>(null)

  function soltar(evento: PointerEvent<Element>, confirmar: boolean) {
    const ponto = pontos.current.get(evento.pointerId)
    if (!ponto) return
    pontos.current.delete(evento.pointerId)
    const atual = { x: evento.clientX, y: evento.clientY }
    if (confirmar && inicio.current && distancia(inicio.current, atual) < 6) {
      const retangulo = evento.currentTarget.getBoundingClientRect()
      tocar?.(atual.x - retangulo.left, atual.y - retangulo.top)
    }
    inicio.current = null
  }

  return {
    onPointerDown(evento: PointerEvent<Element>) {
      if (evento.button !== 0 || pontos.current.size >= 2) return
      const ponto = { x: evento.clientX, y: evento.clientY }
      pontos.current.set(evento.pointerId, ponto)
      inicio.current = pontos.current.size === 1 ? ponto : null
      evento.currentTarget.setPointerCapture(evento.pointerId)
    },
    onPointerMove(evento: PointerEvent<Element>) {
      const anterior = pontos.current.get(evento.pointerId)
      if (!anterior) return
      const atual = { x: evento.clientX, y: evento.clientY }
      const outro = [...pontos.current].find(([id]) => id !== evento.pointerId)?.[1]
      pontos.current.set(evento.pointerId, atual)
      if (outro) {
        aproximar(Math.max(1, distancia(atual, outro)) / Math.max(1, distancia(anterior, outro)))
        return
      }
      if (inicio.current && distancia(inicio.current, atual) >= 6) inicio.current = null
      mover(atual.x - anterior.x, atual.y - anterior.y)
    },
    onPointerUp: (evento: PointerEvent<Element>) => soltar(evento, true),
    onPointerCancel: (evento: PointerEvent<Element>) => soltar(evento, false),
    onLostPointerCapture: (evento: PointerEvent<Element>) => soltar(evento, false),
  }
}
