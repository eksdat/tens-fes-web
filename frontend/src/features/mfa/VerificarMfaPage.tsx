import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../shared/auth/useAuth'
import { Alerta } from '../../shared/ui/Alerta'
import { AuthLayout } from '../../shared/ui/AuthLayout'
import { Botao } from '../../shared/ui/Botao'
import { CampoCodigo } from './CampoCodigo'
import { codigoSchema, type CodigoForm } from './codigoSchema'
import { useNivelMfa } from './useNivelMfa'
import { MENSAGEM_CODIGO_ERRADO, verificarCodigo } from './verificarCodigo'

/** Segundo passo do login para quem tem autenticador: a sessão só vira aal2 depois do código. */
export function VerificarMfaPage() {
  const { sair } = useAuth()
  const nivel = useNivelMfa()
  const navigate = useNavigate()
  const [erro, setErro] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CodigoForm>({ resolver: zodResolver(codigoSchema), defaultValues: { codigo: '' } })

  if (!nivel?.fatorId || nivel.atual === 'aal2') return <Navigate to="/" replace />
  const fatorId = nivel.fatorId

  async function verificar({ codigo }: CodigoForm) {
    setErro(null)
    const resultado = await verificarCodigo(fatorId, codigo)
    if (resultado === 'ok') return navigate('/', { replace: true })
    setErro(resultado === 'codigo' ? MENSAGEM_CODIGO_ERRADO : 'Não foi possível verificar agora. Tente de novo em instantes.')
  }

  return (
    <AuthLayout
      aoVoltar={() => void sair()}
      kicker="Verificação em duas etapas"
      titulo="Confirme que é você"
      texto="Use o código do aplicativo autenticador instalado no seu celular."
    >
      <div className="tf-pilha">
        <h1 className="tf-titulo">Digite o código</h1>
        <p className="tf-sub">Abra o aplicativo autenticador e informe o código de 6 dígitos do Fisiotech.</p>
      </div>

      {erro && (
        <Alerta intencao="perigo" titulo="Não foi possível entrar">
          {erro}
        </Alerta>
      )}

      <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(verificar)(e)}>
        <Controller
          control={control}
          name="codigo"
          render={({ field }) => <CampoCodigo onChange={field.onChange} erro={errors.codigo?.message} />}
        />
        <Botao type="submit" bloco carregando={isSubmitting}>
          Verificar
        </Botao>
      </form>

      <Botao variante="ghost" onClick={() => void sair()}>
        Sair
      </Botao>
    </AuthLayout>
  )
}
