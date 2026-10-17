import { useQuery } from '@tanstack/react-query'
import { buscarFaixas, type Modalidade } from './api'

export function useFaixas(modalidade: Modalidade) {
  return useQuery({
    queryKey: ['parametros', 'faixas', modalidade],
    queryFn: () => buscarFaixas(modalidade),
    staleTime: Infinity,
  })
}
