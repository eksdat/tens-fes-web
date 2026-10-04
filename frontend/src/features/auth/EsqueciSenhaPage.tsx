import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { supabase } from '../../shared/api/supabase'
import { Alerta } from '../../shared/ui/Alerta'
import { AuthLayout } from '../../shared/ui/AuthLayout'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { MENSAGEM_CAPTCHA, useCaptcha } from './captcha'
import { emailSchema } from './schemas'

const schema = z.object({ email: emailSchema })
type Form = z.infer<typeof schema>

export function EsqueciSenhaPage() {
  const [resultado, setResultado] = useState<'enviado' | 'limite' | 'captcha' | null>(null)
  const captcha = useCaptcha()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  async function pedirLink({ email }: Form) {
    if (captcha.ativo && !captcha.token) return setResultado('captcha')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
      captchaToken: captcha.token,
    })
    captcha.renovar()
    // Mesma resposta exista ou não a conta: a tela não pode revelar quem tem cadastro.
    setResultado(error?.code === 'over_email_send_rate_limit' ? 'limite' : 'enviado')
  }

  return (
    <AuthLayout
      voltarPara="/login"
      kicker="Recuperar acesso"
      titulo="Vamos recuperar sua senha"
      texto="Informe o e-mail da conta. Se ela existir, enviamos um link para criar uma nova senha."
    >
      <div className="tf-pilha">
        <h1 className="tf-titulo">Esqueci a senha</h1>
        <p className="tf-sub">Informe o e-mail da sua conta para receber o link de redefinição.</p>
      </div>

      {resultado === 'enviado' && (
        <Alerta intencao="sucesso" titulo="Confira seu e-mail">
          Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha. Veja também a pasta de spam.
        </Alerta>
      )}
      {resultado === 'captcha' && (
        <Alerta intencao="atencao" titulo="Verificação de segurança pendente">
          {MENSAGEM_CAPTCHA}
        </Alerta>
      )}
      {resultado === 'limite' && (
        <Alerta intencao="atencao" titulo="Muitos pedidos seguidos">
          Aguarde alguns minutos antes de pedir um novo link.
        </Alerta>
      )}

      <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(pedirLink)(e)}>
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@exemplo.com"
          erro={errors.email?.message}
          {...register('email')}
        />
        {captcha.campo}
        <Botao type="submit" bloco carregando={isSubmitting}>
          Enviar link
        </Botao>
      </form>

      <BotaoLink to="/login" variante="ghost">
        Voltar para entrar
      </BotaoLink>
    </AuthLayout>
  )
}
