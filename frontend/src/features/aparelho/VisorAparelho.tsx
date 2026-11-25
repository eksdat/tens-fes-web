import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Botao } from '../../shared/ui/Botao'
import { useGestosVisuais } from '../../shared/ui/useGestosVisuais'
import { criarCena, type Alvo } from './cenaAparelho'
import './visorAparelho.css'

const VISTAS = [
  { rotulo: 'Frente', angulo: 0 },
  { rotulo: 'Verso', angulo: Math.PI },
  { rotulo: 'Canais', angulo: -Math.PI / 2 },
  { rotulo: 'Fonte', angulo: Math.PI / 2 },
]

function contem({ polygon }: Alvo, x: number, y: number) {
  const lados = polygon.map(([ax, ay], i) => {
    const [bx, by] = polygon[(i + 1) % polygon.length]
    return (bx - ax) * (y - ay) - (by - ay) * (x - ax)
  })
  return lados.every((v) => v >= 0) || lados.every((v) => v <= 0)
}

export function VisorAparelho({
  ativo,
  selecionar,
  fallback,
}: {
  ativo: number | null
  selecionar: (numero: number) => void
  fallback: ReactNode
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const cena = useRef<ReturnType<typeof criarCena>>(null)
  const alvos = useRef<Alvo[]>([])
  const selecionadoNoModelo = useRef<number | null>(null)
  const [disponivel, setDisponivel] = useState(false)
  const [camera, setCamera] = useState({ angulo: Math.PI / 24, inclinacao: -0.08 })
  const [zoom, setZoom] = useState(1.2)

  function aproximar(fator: number) {
    setZoom((valor) => Math.min(2.5, Math.max(0.65, valor * fator)))
  }

  const gestos = useGestosVisuais({
    aproximar,
    mover: (dx, dy) =>
      setCamera(({ angulo, inclinacao }) => ({
        angulo: angulo + dx * 0.012,
        inclinacao: Math.min(0.65, Math.max(-0.65, inclinacao + dy * 0.008)),
      })),
    tocar: (x, y) => {
      const elemento = canvas.current
      if (!elemento) return
      const relativoX = x - elemento.clientWidth / 2
      const relativoY = y - elemento.clientHeight / 2
      const alvo = alvos.current.find((a) => contem(a, relativoX, relativoY))
      if (alvo) {
        selecionadoNoModelo.current = alvo.id
        selecionar(alvo.id)
      }
    },
  })

  useEffect(() => {
    const elemento = canvas.current
    if (!elemento || typeof WebGLRenderingContext === 'undefined') return
    cena.current = criarCena(elemento, () => setDisponivel(false))
    setDisponivel(cena.current !== null)
    return () => {
      cena.current = null
    }
  }, [])

  useEffect(() => {
    const peloModelo = selecionadoNoModelo.current === ativo
    selecionadoNoModelo.current = null
    if (ativo === null || peloModelo) return
    const angulo = ativo < 9 ? 0 : ativo < 12 ? Math.PI : ativo < 14 ? -Math.PI / 2 : Math.PI / 2
    setCamera({ angulo, inclinacao: 0 })
  }, [ativo])

  useEffect(() => {
    const elemento = canvas.current
    if (!disponivel || !elemento) return
    const desenhar = () => {
      alvos.current = cena.current?.(camera.angulo, camera.inclinacao, zoom, ativo) ?? []
    }
    desenhar()
    const observer = new ResizeObserver(desenhar)
    observer.observe(elemento)
    return () => observer.disconnect()
  }, [ativo, camera, disponivel, zoom])

  return (
    <div className="tf-painel">
      <div hidden={!disponivel} className="tf-visor-aparelho">
        <canvas ref={canvas} aria-hidden="true" {...gestos} />
        <fieldset className="tf-visor-aparelho__acoes">
          <legend className="tf-sr-only">Vistas e zoom do aparelho</legend>
          {VISTAS.map(({ rotulo, angulo }) => (
            <Botao key={rotulo} variante="secundario" onClick={() => setCamera({ angulo, inclinacao: 0 })}>
              {rotulo}
            </Botao>
          ))}
          <Botao variante="secundario" aria-label="Reduzir aparelho" onClick={() => aproximar(1 / 1.2)}>
            −
          </Botao>
          <Botao variante="secundario" aria-label="Ampliar aparelho" onClick={() => aproximar(1.2)}>
            +
          </Botao>
        </fieldset>
        <p className="tf-sub">
          Arraste para girar ou escolha uma vista. Toque em um controle para ver sua função.
        </p>
      </div>
      {!disponivel && fallback}
    </div>
  )
}
