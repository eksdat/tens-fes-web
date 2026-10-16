import { FIGURAS, PLACA } from './montagens'
import placa from './musculos-frente-costas.svg'

type Destaque = { x: number; y: number }

/** Músculos do corpo todo, de frente ou de costas. `destaque` circunda uma região para mostrar onde ela fica. Decorativo: o significado vem dos botões e do texto. */
export function CorpoEsquematico({ figura, destaque }: { figura: 'frente' | 'costas'; destaque?: Destaque }) {
  const f = FIGURAS[figura]
  return (
    <svg className="tf-corpo__svg" viewBox={`${f.x} ${f.y} ${f.w} ${f.h}`} aria-hidden="true" focusable="false">
      <image href={placa} width={PLACA.largura} height={PLACA.altura} />
      {destaque && <circle className="tf-corpo__destaque" cx={destaque.x} cy={destaque.y} r="11" />}
    </svg>
  )
}
