import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Botao } from '../../shared/ui/Botao'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'
import { Dialogo } from '../../shared/ui/Dialogo'

/** Mesma regra do DevolucaoRequest do backend. */
const schema = z.object({
  motivo: z.string().trim().min(1, 'Escreva o motivo da devolução.').max(500, 'Use até 500 caracteres.'),
})

type Valores = z.infer<typeof schema>

type Props = {
  titulo: string
  /** Devolve true quando a API aceitou; aí o diálogo fecha. */
  aoDevolver: (motivo: string) => Promise<boolean>
}

export function DevolverConteudo({ titulo, aoDevolver }: Props) {
  const [aberto, setAberto] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: { motivo: '' } })

  function fechar() {
    if (isSubmitting) return
    setAberto(false)
    reset()
  }

  async function enviar({ motivo }: Valores) {
    if (await aoDevolver(motivo)) {
      setAberto(false)
      reset()
    }
  }

  return (
    <Dialogo
      titulo="Devolver para rascunho?"
      descricao={`"${titulo}" sai da fila e volta para quem escreveu, junto com o motivo.`}
      aberto={aberto}
      aoFechar={fechar}
      gatilho={
        <Botao variante="secundario" aria-label={`Devolver ${titulo}`} onClick={() => setAberto(true)}>
          Devolver
        </Botao>
      }
    >
      <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(enviar)(e)}>
        <CampoTextoLongo
          rotulo="Motivo da devolução"
          dica="Diga o que precisa mudar, por exemplo a fonte que falta."
          maxLength={500}
          erro={errors.motivo?.message}
          {...register('motivo')}
        />
        <div className="tf-acoes">
          <Botao type="submit" carregando={isSubmitting}>
            Devolver para rascunho
          </Botao>
          <Botao variante="secundario" onClick={fechar}>
            Cancelar
          </Botao>
        </div>
      </form>
    </Dialogo>
  )
}
