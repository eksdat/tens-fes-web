import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Alerta } from '../../shared/ui/Alerta'
import { AuthLayout } from '../../shared/ui/AuthLayout'
import { Botao } from '../../shared/ui/Botao'
import { CampoAceiteTermos } from '../auth/cadastro/CampoAceiteTermos'
import { aceitarTermos } from '../usuario/aceitarTermos'
import { CHAVE_USUARIO_ATUAL } from '../usuario/useUsuarioAtual'

const schema = z.object({
  termos: z.boolean().refine((v) => v, 'Aceite os termos de uso e a política de privacidade'),
})

/** Aparece quando a versão dos termos mudou desde o último aceite (`termosPendentes` da API). */
export function AceitarTermosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erro, setErro] = useState(false)
  const form = useForm<{ termos: boolean }>({ resolver: zodResolver(schema), defaultValues: { termos: false } })

  async function continuar() {
    setErro(false)
    try {
      const usuario = await aceitarTermos()
      queryClient.setQueryData(CHAVE_USUARIO_ATUAL, usuario)
      navigate('/', { replace: true })
    } catch {
      setErro(true)
    }
  }

  return (
    <AuthLayout
      kicker="Atualização"
      titulo="Os termos mudaram"
      texto="Leia o que mudou e aceite para continuar usando a plataforma."
    >
      <h1 className="tf-titulo">Termos atualizados</h1>
      <p className="tf-sub">
        Incluímos como funcionam os dados de pacientes: só o profissional que cadastrou vê o paciente, e um paciente
        excluído é apagado de vez 90 dias depois. Continue usando apenas dados fictícios.
      </p>
      {erro && (
        <Alerta intencao="perigo" titulo="Não foi possível registrar o aceite">
          Tente de novo em instantes.
        </Alerta>
      )}
      <FormProvider {...form}>
        <form className="tf-pilha" noValidate onSubmit={form.handleSubmit(continuar)}>
          <CampoAceiteTermos />
          <Botao type="submit" bloco carregando={form.formState.isSubmitting}>
            Continuar
          </Botao>
        </form>
      </FormProvider>
    </AuthLayout>
  )
}
