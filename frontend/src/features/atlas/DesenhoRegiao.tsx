import { LADO_ELETRODO, PLACA, type Montagem } from './montagens'
import placa from './musculos-frente-costas.svg'

/** A região sobre a ilustração anatômica, com os eletrodos em escala. A cor distingue o canal; o código vem sempre escrito. */
export function DesenhoRegiao({ montagem }: { montagem: Montagem }) {
  const r = montagem.recorte
  return (
    <svg className="tf-desenho" viewBox={`${r.x} ${r.y} ${r.w} ${r.h}`} aria-hidden="true" focusable="false">
      <image href={placa} width={PLACA.largura} height={PLACA.altura} />
      {montagem.eletrodos.map((e) => (
        <g key={e.codigo}>
          <rect
            className={`tf-eletrodo tf-eletrodo--c${e.canal}`}
            x={e.x - LADO_ELETRODO / 2}
            y={e.y - LADO_ELETRODO / 2}
            width={LADO_ELETRODO}
            height={LADO_ELETRODO}
            rx="1"
          />
          <text
            className={`tf-eletrodo__codigo tf-eletrodo__codigo--c${e.canal}`}
            x={e.x}
            y={e.y}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {e.codigo}
          </text>
        </g>
      ))}
    </svg>
  )
}
