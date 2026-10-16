import { useQuery } from '@tanstack/react-query'
import { Alerta } from '../../shared/ui/Alerta'
import { chaveAvaliacoes, ITENS_TRIAGEM, listarAvaliacoes } from '../avaliacao/api'
import { formatarData } from '../pacientes/formatar'

const lista = (itens: string[]) => itens.join(', ')

/**
 * Mostra, antes da sessão, a triagem da avaliação mais recente: o que está presente e o que nunca foi avaliado.
 * Sem avaliação, a triagem toda é "não avaliado" e o guia manda concluí-la antes de aplicar (gatilho "Risco não esclarecido").
 */
export function AvisoTriagem({ pacienteId }: { pacienteId: string }) {
  const { data } = useQuery({
    queryKey: [...chaveAvaliacoes(pacienteId), 'desc'],
    queryFn: () => listarAvaliacoes(pacienteId, 'desc'),
  })
  if (!data) return null

  const ultima = data[0]
  if (!ultima) {
    return (
      <Alerta intencao="atencao" titulo="Este paciente ainda não tem avaliação inicial.">
        A triagem de risco está não avaliada. Conclua a avaliação antes de registrar uma aplicação planejada.
      </Alerta>
    )
  }

  const rotulos = (estado: string) =>
    ITENS_TRIAGEM.filter(({ item }) => ultima.triagem[item] === estado).map(({ rotulo }) => rotulo)
  const presentes = rotulos('PRESENTE')
  const naoAvaliados = rotulos('NAO_AVALIADO')
  const data_ = formatarData(ultima.dataAvaliacao)

  if (presentes.length === 0 && naoAvaliados.length === 0) return null

  return (
    <Alerta
      intencao="atencao"
      titulo={
        presentes.length > 0
          ? `Triagem presente na avaliação de ${data_}: ${lista(presentes)}.`
          : `Triagem da avaliação de ${data_} sem item presente.`
      }
    >
      {naoAvaliados.length > 0 ? `Itens ainda não avaliados: ${lista(naoAvaliados)}.` : undefined}
    </Alerta>
  )
}
