import { Alerta } from '../../shared/ui/Alerta'
import { AVISO_CONTEUDO_PENDENTE } from './avisoPendente'
import { PaginaTecnica } from './PaginaTecnica'

export function ConteudoPendente({ titulo }: { titulo: string }) {
  return (
    <PaginaTecnica titulo={titulo}>
      <Alerta titulo={AVISO_CONTEUDO_PENDENTE.titulo}>{AVISO_CONTEUDO_PENDENTE.texto}</Alerta>
    </PaginaTecnica>
  )
}
