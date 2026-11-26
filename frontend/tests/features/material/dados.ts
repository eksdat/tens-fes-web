import type { Material } from '@/features/material/api'

/** Material fictício para os testes: rascunho de TENS sem anexo; o resto muda por "extra". */
export function material(id: number, titulo: string, extra: Partial<Material> = {}): Material {
  return {
    id,
    titulo,
    modalidade: 'TENS',
    secao: 'PARAMETROS',
    corpo: 'Frequência de 50 a 100 Hz no exemplo fictício.',
    referencias: '[R1] Johnson, 2007',
    estado: 'RASCUNHO',
    motivoDevolucao: null,
    dataRevisao: null,
    anexos: [],
    criadoEm: '2026-11-10T15:00:00Z',
    atualizadoEm: '2026-11-10T15:00:00Z',
    ...extra,
  }
}
