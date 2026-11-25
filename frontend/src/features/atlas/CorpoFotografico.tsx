import { useRef, useState } from 'react'
import { Botao } from '../../shared/ui/Botao'
import { useGestosVisuais } from '../../shared/ui/useGestosVisuais'
import type { Montagem } from './montagens'
import imagem from './corpo-frente-costas.webp'
import { ALTURA, COORDENADAS, desvio, LARGURA, type Figura } from './posicoesFotograficas'
import './atlasFotografico.css'

export function CorpoFotografico({ figura }: { figura: Figura }) {
  return (
    <svg
      className="tf-corpo__svg tf-corpo__foto"
      viewBox={`${desvio(figura)} 0 ${LARGURA} ${ALTURA}`}
      aria-hidden="true"
      focusable="false"
    >
      <image href={imagem} width={LARGURA * 2} height={ALTURA} />
    </svg>
  )
}

export function AproximacaoDoCorpo({ montagem }: { montagem: Montagem }) {
  const { centro, eletrodos } = COORDENADAS[montagem.id]
  const [zoom, setZoom] = useState(1)
  const [foco, setFoco] = useState(centro)
  const [ativo, setAtivo] = useState<number | null>(null)
  const quadro = useRef<SVGSVGElement>(null)
  const largura = 460 / zoom
  const altura = 315 / zoom
  const origem = desvio(montagem.ponto.figura)

  function aproximar(fator: number) {
    setZoom((valor) => Math.min(2.5, Math.max(0.65, valor * fator)))
  }

  const gestos = useGestosVisuais({
    aproximar,
    mover: (dx, dy) => {
      setFoco(([x, y]) => [
        Math.min(
          origem + LARGURA - largura / 2,
          Math.max(origem + largura / 2, x - (dx * largura) / (quadro.current?.clientWidth || largura)),
        ),
        Math.min(
          ALTURA - altura / 2,
          Math.max(altura / 2, y - (dy * altura) / (quadro.current?.clientHeight || altura)),
        ),
      ])
    },
    tocar: (x, y) => {
      const svg = quadro.current
      if (!svg) return
      const cx = foco[0] - largura / 2 + (x * largura) / svg.clientWidth
      const cy = foco[1] - altura / 2 + (y * altura) / svg.clientHeight
      const indice = eletrodos.findIndex(([ex, ey]) => Math.abs(ex - cx) <= 16 && cy >= ey - 26 && cy <= ey + 14)
      if (indice >= 0) setAtivo(indice)
    },
  })
  const selecionado = ativo === null ? undefined : montagem.eletrodos[ativo]

  return (
    <div className="tf-foto-regiao">
      <p className="tf-corpo__rotulo">Onde fica</p>
      <svg
        ref={quadro}
        className="tf-foto-regiao__visor"
        viewBox={`${foco[0] - largura / 2} ${foco[1] - altura / 2} ${largura} ${altura}`}
        aria-hidden="true"
        focusable="false"
        {...gestos}
      >
        <image href={imagem} width={LARGURA * 2} height={ALTURA} />
        {montagem.eletrodos.map(({ codigo, canal }, indice) => {
          const [x, y] = eletrodos[indice]
          return (
            <g key={codigo} transform={`translate(${x} ${y})`}>
              <path
                d="M 11 0 C 25 0, 28 5, 32 17"
                fill="none"
                stroke={canal === 1 ? '#ef8d73' : '#77d3de'}
                strokeWidth="2"
              />
              <rect
                x="-12"
                y="-12"
                width="24"
                height="24"
                rx="5"
                fill="#263444"
                stroke={ativo === indice ? '#ffdd8e' : '#85939e'}
                strokeWidth="1.5"
              />
              <circle r="4" fill="#8b9aa6" />
              <rect x="-12" y="-27" width="24" height="13" rx="3" fill="#14263a" />
              <text y="-17.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                {codigo}
              </text>
            </g>
          )
        })}
      </svg>
      <fieldset className="tf-foto-regiao__acoes">
        <legend className="tf-sr-only">Zoom e eletrodos da região</legend>
        <Botao variante="secundario" aria-label="Reduzir região" onClick={() => aproximar(1 / 1.25)}>
          −
        </Botao>
        <Botao variante="secundario" aria-label="Ampliar região" onClick={() => aproximar(1.25)}>
          +
        </Botao>
        <Botao
          variante="secundario"
          onClick={() => {
            setZoom(1)
            setFoco(centro)
          }}
        >
          Recentrar
        </Botao>
        {montagem.eletrodos.map(({ codigo }, indice) => (
          <Botao
            key={codigo}
            variante="secundario"
            aria-label={`Eletrodo ${codigo}`}
            aria-pressed={ativo === indice}
            onClick={() => setAtivo(indice)}
          >
            {codigo}
          </Botao>
        ))}
      </fieldset>
      <p className="tf-sub" aria-live="polite">
        {selecionado
          ? `${selecionado.codigo} · canal ${selecionado.canal} · ${selecionado.posicao}`
          : 'Imagem ilustrativa. Use a pinça para ampliar ou toque em um eletrodo para ver a posição descrita.'}
      </p>
    </div>
  )
}
