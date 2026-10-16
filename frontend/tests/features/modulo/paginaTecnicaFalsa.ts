import type { PaginaTecnicaApi } from '@/features/modulo/usePaginaTecnica'

/** Substitui `usePaginaTecnica` nos testes de módulo: Visão geral liberada, com o texto da V6. */
const BLOCOS: Record<'TENS' | 'FES', PaginaTecnicaApi['blocos']> = {
  TENS: [
    { bloco: 'O_QUE_E', titulo: 'O que é TENS', corpo: 'TENS significa estimulação elétrica nervosa transcutânea.', referencias: '[R1] Johnson, 2007' },
    { bloco: 'PARA_QUE_SERVE', titulo: 'O que a evidência mostra', corpo: 'A revisão meta-TENS encontrou redução de dor.', referencias: '[R2] Johnson et al., 2022' },
    { bloco: 'COMO_INTERPRETAR', titulo: 'Como o TENS age na dor', corpo: 'O TENS convencional busca uma sensação forte e confortável.', referencias: '[R1] Johnson, 2007' },
    { bloco: 'EXEMPLO', titulo: 'Exemplo didático', corpo: 'Caso fictício: dor localizada no joelho.', referencias: 'Guia técnico TENS + FES, seção 07' },
    { bloco: 'CUIDADOS', titulo: 'Cuidados', corpo: '- Buscar dor não é meta do TENS convencional.', referencias: '[R1] Johnson, 2007' },
  ],
  FES: [
    { bloco: 'O_QUE_E', titulo: 'O que é FES', corpo: 'FES significa estimulação elétrica funcional.', referencias: '[R3] Nussbaum et al., 2017' },
    { bloco: 'PARA_QUE_SERVE', titulo: 'Alvos funcionais', corpo: '- **Dorsiflexão:** elevação do antepé.', referencias: 'Guia técnico TENS + FES, seção 08' },
    {
      bloco: 'COMO_INTERPRETAR',
      titulo: 'Diferença entre NMES e FES',
      corpo: '| Termo | Significado |\n| --- | --- |\n| "FES" no aparelho | Pode ser só o nome comercial de um programa muscular. |',
      referencias: '[R3] Nussbaum et al., 2017',
    },
    { bloco: 'EXEMPLO', titulo: 'Exemplo didático', corpo: 'Exercício fictício de abertura da mão.', referencias: 'Guia técnico TENS + FES, seção 08' },
    { bloco: 'CUIDADOS', titulo: 'Limites que mudam a decisão', corpo: 'A ausência de contração não autoriza aumentar a corrente indefinidamente.', referencias: '[R3]; [R5]' },
  ],
}

export function usePaginaTecnica(modalidade: 'TENS' | 'FES') {
  const blocos = BLOCOS[modalidade]
  return {
    isPending: false,
    isError: false,
    data: {
      modalidade,
      secao: 'VISAO_GERAL',
      liberada: true,
      blocos,
      referencias: [...new Set(blocos.map((b) => b.referencias as string))],
      dataRevisao: '2026-10-10',
    } satisfies PaginaTecnicaApi,
  }
}
