import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { z } from 'zod'
import { supabase, urlDeRetornoAuth } from '../../../shared/api/supabase'
import { definirManterConectado } from '../../../shared/auth/armazenamento'
import { useAuth } from '../../../shared/auth/useAuth'
import { Alerta } from '../../../shared/ui/Alerta'
import { AuthLayout } from '../../../shared/ui/AuthLayout'
import { Botao, BotaoLink } from '../../../shared/ui/Botao'
import { Campo } from '../../../shared/ui/Campo'
import { CampoSenha } from '../../../shared/ui/CampoSenha'
import { BotaoGoogle } from './BotaoGoogle'
import { MENSAGEM_CAPTCHA, useCaptcha } from '../captcha/captcha'
import { emailSchema } from '../schemas'

const schema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Informe sua senha'),
  manter: z.boolean(),
})

type LoginForm = z.infer<typeof schema>

type Aviso =
  | { tipo: 'erro'; texto: string }
  | { tipo: 'naoConfirmado' }
  | { tipo: 'reenviado' }
  | null

export function LoginPage() {
  const { sessao } = useAuth()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState<Aviso>(null)
  const captcha = useCaptcha()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema), defaultValues: { manter: false } })

  if (sessao) return <Navigate to="/" replace />

  async function entrar({ email, senha, manter }: LoginForm) {
    setAviso(null)
    if (captcha.ativo && !captcha.token) return setAviso({ tipo: 'erro', texto: MENSAGEM_CAPTCHA })
    definirManterConectado(manter)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
      options: { captchaToken: captcha.token },
    })
    captcha.renovar()
    if (!error) {
      navigate('/', { replace: true })
      return
    }
    if (error.code === 'email_not_confirmed') return setAviso({ tipo: 'naoConfirmado' })
    if (error.code === 'invalid_credentials') return setAviso({ tipo: 'erro', texto: 'E-mail ou senha incorretos.' })
    if (error.code === 'over_request_rate_limit') {
      return setAviso({ tipo: 'erro', texto: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' })
    }
    setAviso({ tipo: 'erro', texto: 'Não foi possível entrar agora. Tente de novo em instantes.' })
  }

  async function reenviarConfirmacao() {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: getValues('email'),
      options: { emailRedirectTo: urlDeRetornoAuth(), captchaToken: captcha.token },
    })
    captcha.renovar()
    setAviso(
      error
        ? { tipo: 'erro', texto: 'Não foi possível reenviar o e-mail agora. Aguarde um instante e tente de novo.' }
        : { tipo: 'reenviado' },
    )
  }

  return (
    <AuthLayout
      faixa
      kicker="Estudantes e fisioterapeutas"
      titulo="Aprenda e documente TENS e FES"
      texto="Conteúdo técnico, exploração do aparelho e simulador. Profissionais organizam avaliações, sessões e evolução de seus pacientes."
    >
      <div className="tf-pilha">
        <h1 className="tf-titulo">Entrar</h1>
        <p className="tf-sub">Acesse com o e-mail e a senha da sua conta.</p>
      </div>

      {aviso?.tipo === 'erro' && <Alerta intencao="perigo" titulo="Não foi possível entrar">{aviso.texto}</Alerta>}
      {aviso?.tipo === 'naoConfirmado' && (
        <Alerta
          intencao="atencao"
          titulo="Confirme seu e-mail antes de entrar"
          acao={
            <Botao variante="secundario" onClick={() => void reenviarConfirmacao()}>
              Reenviar e-mail de confirmação
            </Botao>
          }
        >
          Enviamos um link de confirmação quando você criou a conta. Veja também a pasta de spam.
        </Alerta>
      )}
      {aviso?.tipo === 'reenviado' && (
        <Alerta intencao="sucesso" titulo="E-mail reenviado">
          Enviamos um novo link de confirmação. Veja também a pasta de spam.
        </Alerta>
      )}

      <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(entrar)(e)}>
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@exemplo.com"
          erro={errors.email?.message}
          {...register('email')}
        />
        <CampoSenha rotulo="Senha" autoComplete="current-password" erro={errors.senha?.message} {...register('senha')} />

        <div className="tf-linha">
          <label className="tf-check">
            <input type="checkbox" {...register('manter')} />
            Manter conectado
          </label>
          <Link className="tf-link" to="/esqueci-senha">
            Esqueci minha senha
          </Link>
        </div>

        {captcha.campo}
        <Botao type="submit" bloco carregando={isSubmitting}>
          Entrar
        </Botao>
      </form>

      <div className="tf-divisor">ou</div>
      <BotaoGoogle antes={() => definirManterConectado(getValues('manter'))} />

      <div className="tf-divisor">Ainda não tem conta?</div>
      <BotaoLink to="/cadastro" bloco>
        Criar conta
      </BotaoLink>
    </AuthLayout>
  )
}
