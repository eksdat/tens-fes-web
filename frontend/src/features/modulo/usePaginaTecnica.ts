import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

export type Bloco = 'O_QUE_E' | 'PARA_QUE_SERVE' | 'COMO_INTERPRETAR' | 'EXEMPLO' | 'CUIDADOS'

export type PaginaTecnicaApi = {
  modalidade: 'TENS' | 'NMES' | 'FES'
  secao: 'VISAO_GERAL' | 'APARELHO' | 'ELETRODOS' | 'PARAMETROS' | 'SEGURANCA' | 'CASOS'
  /** Falso enquanto faltar bloco ou algum bloco não estiver aprovado; a API então não manda texto. */
  liberada: boolean
  blocos: { bloco: Bloco; titulo: string; corpo: string; referencias: string | null }[]
  referencias: string[]
  /** ISO (aaaa-mm-dd); nulo sem revisão docente. */
  dataRevisao: string | null
}

export function usePaginaTecnica(modalidade: PaginaTecnicaApi['modalidade'], secao: PaginaTecnicaApi['secao']) {
  return useQuery({
    queryKey: ['conteudos', 'pagina', modalidade, secao],
    queryFn: async () => (await api.get<PaginaTecnicaApi>('/conteudos/pagina', { params: { modalidade, secao } })).data,
  })
}
