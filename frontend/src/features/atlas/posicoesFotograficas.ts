import type { Montagem } from './montagens'

type Ponto = [number, number]
export type Figura = Montagem['ponto']['figura']

// Coordenadas da imagem gerada. Os textos e códigos vêm da montagem oficial do atlas.
export const COORDENADAS: Record<Montagem['id'], { centro: Ponto; eletrodos: Ponto[] }> = {
  lombar: {
    centro: [1124, 382],
    eletrodos: [
      [1091, 368],
      [1090, 396],
      [1160, 368],
      [1160, 396],
    ],
  },
  joelho: {
    centro: [474, 693],
    eletrodos: [
      [458, 664],
      [491, 720],
    ],
  },
  quadriceps: {
    centro: [362, 606],
    eletrodos: [
      [365, 570],
      [354, 633],
    ],
  },
  'tibial-anterior': {
    centro: [486, 790],
    eletrodos: [
      [481, 758],
      [487, 820],
    ],
  },
  'extensores-punho': {
    centro: [971, 432],
    eletrodos: [
      [987, 405],
      [956, 460],
    ],
  },
  ombro: {
    centro: [1204, 227],
    eletrodos: [
      [1187, 202],
      [1219, 246],
    ],
  },
  abdomen: {
    centro: [418, 387],
    eletrodos: [
      [386, 363],
      [383, 398],
      [446, 363],
      [449, 398],
    ],
  },
  isquiotibiais: {
    centro: [1072, 610],
    eletrodos: [
      [1071, 574],
      [1075, 640],
    ],
  },
}

export const LARGURA = 768
export const ALTURA = 1024
export const desvio = (figura: Figura) => (figura === 'frente' ? 0 : LARGURA)

export function posicaoNoCorpo(montagem: Montagem) {
  const [x, y] = COORDENADAS[montagem.id].centro
  return { left: `${((x - desvio(montagem.ponto.figura)) / LARGURA) * 100}%`, top: `${(y / ALTURA) * 100}%` }
}
