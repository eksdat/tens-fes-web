import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Navigate } from 'react-router'
import { useAuth } from '../../../shared/auth/useAuth'
import { Alerta } from '../../../shared/ui/Alerta'
import { AuthLayout } from '../../../shared/ui/AuthLayout'
import { Botao, BotaoLink } from '../../../shared/ui/Botao'
import { Campo } from '../../../shared/ui/Campo'
import { TelaCarregando } from '../../../shared/ui/TelaCarregando'
import { cadastrarUsuario, lerErroDeCadastro } from '../../usuario/cadastrarUsuario'
import { CHAVE_USUARIO_ATUAL, useUsuarioAtual } from '../../usuario/useUsuarioAtual'
import {
  completarSchema,
  deCadastroRequest,
  lerCadastroDoUsuario,
  paraCadastroRequest,
  PERFIL_VAZIO,
  type CadastroRequest,
  type CompletarForm,
} from './cadastro'
import { CampoAceiteTermos } from './CampoAceiteTermos'
import { PerfilCampos } from './PerfilCampos'

/** Campos da API que viram campo do formulário. */
function campoDoFormulario(campoDaApi: string): keyof CompletarForm | null {
  return ['nome', 'instituicao', 'periodo', 'categoria', 'registro', 'uf'].includes(campoDaApi)
    ? (campoDaApi as keyof CompletarForm)
    : null
}

/**
 * Destino de quem confirmou o e-mail e ainda não tem cadastro na API. Se os dados da etapa 2 vieram junto com a
 * conta (user_metadata), envia sozinho; se faltarem ou a API recusar, mostra o formulário para completar.
 */
export function CompletarCadastroPage() {
  const { sessao, carregando, sair } = useAuth()
  const usuario = useUsuarioAtual()
  const queryClient = useQueryClient()
  const guardado = lerCadastroDoUsuario(sessao?.user.user_metadata)
  const [concluido, setConcluido] = useState(false)
  const [enviandoAutomatico, setEnviandoAutomatico] = useState(!!guardado)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const tentouAutomatico = useRef(false)

  const form = useForm<CompletarForm>({
    resolver: zodResolver(completarSchema),
    defaultValues: guardado ? deCadastroRequest(guardado) : { nome: '', termos: false, ...PERFIL_VAZIO },
  })
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form

  async function enviar(corpo: CadastroRequest, comCampos = false) {
    setErroGeral(null)
    try {
      await cadastrarUsuario(corpo)
    } catch (erro) {
      const lido = lerErroDeCadastro(erro)
      if (!lido.jaCadastrado) {
        setEnviandoAutomatico(false)
        setErroGeral(lido.mensagem)
        if (comCampos) {
          for (const [campo, mensagem] of Object.entries(lido.campos)) {
            const destino = campoDoFormulario(campo)
            if (destino) setError(destino, { message: mensagem })
          }
        }
        return
      }
    }
    await queryClient.invalidateQueries({ queryKey: CHAVE_USUARIO_ATUAL })
    setEnviandoAutomatico(false)
    setConcluido(true)
  }

  // Quem entrou pelo Google já tem nome no provedor: sugere no formulário, e a pessoa confere.
  const nomeDoProvedor = sessao?.user.user_metadata?.full_name
  useEffect(() => {
    if (typeof nomeDoProvedor === 'string' && !getValues('nome')) setValue('nome', nomeDoProvedor)
  }, [nomeDoProvedor, getValues, setValue])

  useEffect(() => {
    if (!guardado || tentouAutomatico.current || !sessao || usuario.data !== null) return
    tentouAutomatico.current = true
    void enviar(guardado)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dispara uma vez, quando a sessão e o estado "sem cadastro" chegam
  }, [sessao, usuario.data])

  if (carregando || (sessao && usuario.isPending)) return <TelaCarregando />
  if (!sessao) return <Navigate to="/login" replace />

  if (concluido) {
    return (
      <AuthLayout kicker="Tudo certo" titulo="Bem-vindo ao Fisiotech" texto="Seu acesso está liberado.">
        <div className="tf-pilha">
          <h1 className="tf-titulo">Cadastro concluído</h1>
        </div>
        <Alerta intencao="sucesso" titulo="Perfil registrado">
          Seu e-mail foi confirmado e o seu perfil foi registrado.
        </Alerta>
        <BotaoLink to="/" variante="primario" bloco>
          Continuar
        </BotaoLink>
      </AuthLayout>
    )
  }

  if (usuario.data) return <Navigate to="/" replace />
  if (enviandoAutomatico) return <TelaCarregando />

  return (
    <AuthLayout aoVoltar={() => void sair()} kicker="Quase lá" titulo="Complete seu cadastro" texto="Falta informar seu perfil para liberar o acesso.">
      <div className="tf-pilha">
        <h1 className="tf-titulo">Complete seu cadastro</h1>
        <p className="tf-sub">Conta confirmada. Agora escolha como você vai usar a plataforma.</p>
      </div>

      {erroGeral && (
        <Alerta intencao="perigo" titulo="Não foi possível concluir">
          {erroGeral}
        </Alerta>
      )}

      <FormProvider {...form}>
        <form
          className="tf-pilha"
          noValidate
          onSubmit={(e) => void handleSubmit((v) => enviar(paraCadastroRequest(v), true))(e)}
        >
          <Campo rotulo="Nome completo" autoComplete="name" erro={errors.nome?.message} {...register('nome')} />
          <PerfilCampos />
          <CampoAceiteTermos />
          <Botao type="submit" bloco carregando={isSubmitting}>
            Concluir cadastro
          </Botao>
        </form>
      </FormProvider>

      <Botao variante="ghost" onClick={() => void sair()}>
        Sair
      </Botao>
    </AuthLayout>
  )
}
