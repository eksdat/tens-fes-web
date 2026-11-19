import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
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
  /** Null quando a API aceitou (o diálogo fecha); senão, a mensagem de erro, mostrada dentro do diálogo. */
  aoDevolver: (motivo: string) => Promise<string | null>
  /** Chamado ao fechar sem devolver (Cancelar, Esc ou X). */
  aoFechar?: () => void
}

/**
 * O erro fica dentro do diálogo: fora dele, atrás da camada escura, ninguém vê e o leitor de tela não lê
 * (revisão do PR #38).
 */
export function DevolverConteudo({ titulo, aoDevolver, aoFechar }: Props) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: { motivo: '' } })

  function fechar() {
    if (isSubmitting) return
    setAberto(false)
    setErro(null)
    reset()
    aoFechar?.()
  }

  async function enviar({ motivo }: Valores) {
    setErro(null)
    const falha = await aoDevolver(motivo)
    if (falha === null) {
      setAberto(false)
      reset()
    } else {
      setErro(falha)
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
        {erro && (
          <Alerta intencao="perigo" titulo="Não foi possível devolver">
            {erro}
          </Alerta>
        )}
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
