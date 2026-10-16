import { Alerta } from '../../shared/ui/Alerta'
import { PaginaTecnica } from './PaginaTecnica'

export function ConteudoPendente({ titulo }: { titulo: string }) {
  return (
    <PaginaTecnica titulo={titulo}>
      <Alerta titulo="Conteúdo ainda não liberado">
        Esta seção depende da revisão do conteúdo técnico e fica disponível quando for aprovada.
      </Alerta>
    </PaginaTecnica>
  )
}
