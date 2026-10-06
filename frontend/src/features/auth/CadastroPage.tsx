import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { Link, Navigate } from 'react-router'
import { supabase, urlDeRetornoAuth } from '../../shared/api/supabase'
import { useAuth } from '../../shared/auth/useAuth'
import { Alerta } from '../../shared/ui/Alerta'
import { AuthLayout } from '../../shared/ui/AuthLayout'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { CampoSenha } from '../../shared/ui/CampoSenha'
import { EtapaProgresso } from '../../shared/ui/EtapaProgresso'
import { IconeEnvelope } from '../../shared/ui/Icones'
import {
  CAMPOS_ETAPA_1,
  paraCadastroRequest,
  PERFIL_VAZIO,
  type CadastroForm,
} from './cadastro'
import { PerfilCampos } from './PerfilCampos'
import { BotaoGoogle } from './BotaoGoogle'
import { MENSAGEM_CAPTCHA, useCaptcha } from './captcha'
import { CampoAceiteTermos } from './CampoAceiteTermos'
import { cadastroSeguroSchema } from './cadastroSeguro'
import { dadosPessoais } from './forcaSenha'
import { RequisitosSenha } from './RequisitosSenha'

type Etapa = 1 | 2 | 'verificar'

const PAINEL = {
  kicker: 'Crie sua conta',
  titulo: 'Estude, pratique e registre',
  texto:
    'Estudantes acessam o conteúdo técnico, o aparelho e o simulador. Profissionais também organizam avaliações, sessões e evolução de seus pacientes.',
}

const PAINEL_VERIFICACAO = {
  kicker: 'Quase lá',
  titulo: 'Confirme seu e-mail',
  texto: 'A confirmação garante que só você acessa sua conta e os registros feitos nela.',
}

const SEGUNDOS_ENTRE_ENVIOS = 60

function mensagemDoErro(code: string | undefined): string {
  if (code === 'weak_password') return 'A senha não atende à política de segurança. Escolha uma senha mais forte.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.'
  }
  return 'Não foi possível criar a conta agora. Tente de novo em instantes.'
}

export function CadastroPage() {
  const { sessao } = useAuth()
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const captcha = useCaptcha()
  const titulo = useRef<HTMLHeadingElement>(null)
  const primeiraRenderizacao = useRef(true)

  const form = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSeguroSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmacao: '', termos: false, ...PERFIL_VAZIO },
  })
  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = form

  // Ao trocar de etapa, o foco vai para o título: leitores de tela anunciam a nova tela.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    titulo.current?.focus()
  }, [etapa])

  const [senha, nome, email] = useWatch({ control, name: ['senha', 'nome', 'email'] })

  if (sessao) return <Navigate to="/" replace />

  async function continuar() {
    if (await trigger([...CAMPOS_ETAPA_1])) setEtapa(2)
  }

  async function criarConta(valores: CadastroForm) {
    setErroGeral(null)
    if (captcha.ativo && !captcha.token) return setErroGeral(MENSAGEM_CAPTCHA)
    const { error } = await supabase.auth.signUp({
      email: valores.email,
      password: valores.senha,
      options: {
        emailRedirectTo: urlDeRetornoAuth(),
        captchaToken: captcha.token,
        // Guarda a etapa 2 para o primeiro login: o link do e-mail pode abrir em outro dispositivo.
        data: { cadastro: paraCadastroRequest(valores) },
      },
    })
    captcha.renovar()
    // Conta já existente responde igual a conta nova: a tela não pode revelar quem já tem cadastro.
    if (error && error.code !== 'user_already_exists' && error.code !== 'email_exists') {
      setErroGeral(mensagemDoErro(error.code))
      return
    }
    setEtapa('verificar')
  }

  function aoInvalidar(erros: FieldErrors<CadastroForm>) {
    if (CAMPOS_ETAPA_1.some((campo) => erros[campo])) setEtapa(1)
  }

  const painel = etapa === 'verificar' ? PAINEL_VERIFICACAO : PAINEL

  return (
    <AuthLayout
      {...painel}
      {...(etapa === 1 ? { voltarPara: '/login' } : { aoVoltar: () => setEtapa(1) })}
    >
      {etapa === 'verificar' ? (
        <VerificarEmail email={getValues('email')} titulo={titulo} aoAlterarEmail={() => setEtapa(1)} />
      ) : (
        <FormProvider {...form}>
          <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(criarConta, aoInvalidar)(e)}>
            <EtapaProgresso atual={etapa} total={2} titulo={etapa === 1 ? 'Seus dados' : 'Seu perfil'} />
            <div className="tf-pilha">
              <h1 className="tf-titulo" ref={titulo} tabIndex={-1}>
                Criar conta
              </h1>
              <p className="tf-sub">
                {etapa === 1
                  ? 'Preencha seus dados. Enviaremos um link para confirmar o e-mail.'
                  : 'Escolha como você vai usar a plataforma.'}
              </p>
            </div>

            {erroGeral && (
              <Alerta intencao="perigo" titulo="Não foi possível criar a conta">
                {erroGeral}
              </Alerta>
            )}

            {etapa === 1 && (
              <>
                <Campo rotulo="Nome completo" autoComplete="name" erro={errors.nome?.message} {...register('nome')} />
                <Campo
                  rotulo="E-mail"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="nome@exemplo.com"
                  erro={errors.email?.message}
                  {...register('email')}
                />
                <CampoSenha
                  rotulo="Senha"
                  autoComplete="new-password"
                  erro={errors.senha?.message}
                  {...register('senha')}
                />
                <RequisitosSenha senha={senha} dados={dadosPessoais(nome, email)} />
                <CampoSenha
                  rotulo="Confirme a senha"
                  autoComplete="new-password"
                  erro={errors.confirmacao?.message}
                  {...register('confirmacao')}
                />
                <CampoAceiteTermos />
                <Botao bloco onClick={() => void continuar()}>
                  Continuar
                </Botao>
              </>
            )}

            {etapa === 2 && (
              <>
                <PerfilCampos />
                {captcha.campo}
                <Botao type="submit" bloco carregando={isSubmitting}>
                  Criar conta
                </Botao>
              </>
            )}
          </form>

          {etapa === 1 && (
            <>
              <div className="tf-divisor">ou</div>
              <BotaoGoogle />
              <p className="tf-centro">
                Já tem conta?{' '}
                <Link className="tf-link" to="/login">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </FormProvider>
      )}
    </AuthLayout>
  )
}

function VerificarEmail({
  email,
  titulo,
  aoAlterarEmail,
}: {
  email: string
  titulo: React.RefObject<HTMLHeadingElement | null>
  aoAlterarEmail: () => void
}) {
  const [restante, setRestante] = useState(SEGUNDOS_ENTRE_ENVIOS)
  const [resultado, setResultado] = useState<'reenviado' | 'erro' | null>(null)
  const captcha = useCaptcha()

  useEffect(() => {
    if (restante <= 0) return
    const espera = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(espera)
  }, [restante])

  async function reenviar() {
    setResultado(null)
    if (captcha.ativo && !captcha.token) return setResultado('erro')
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: urlDeRetornoAuth(), captchaToken: captcha.token },
    })
    captcha.renovar()
    if (error) return setResultado('erro')
    setResultado('reenviado')
    setRestante(SEGUNDOS_ENTRE_ENVIOS)
  }

  const contagem = `${String(Math.floor(restante / 60)).padStart(2, '0')}:${String(restante % 60).padStart(2, '0')}`

  return (
    <>
      <div className="tf-selo" aria-hidden="true">
        <IconeEnvelope />
      </div>
      <div className="tf-pilha">
        <h1 className="tf-titulo" ref={titulo} tabIndex={-1}>
          Verifique seu e-mail
        </h1>
        <p className="tf-sub">
          Se o e-mail <strong>{email}</strong> ainda não tem conta, enviamos um link de confirmação. Abra o e-mail e
          clique no link para ativar o seu acesso.
        </p>
        <p className="tf-sub">Não encontrou? Confira também a caixa de spam.</p>
      </div>

      {resultado === 'reenviado' && (
        <Alerta intencao="sucesso" titulo="E-mail reenviado">
          Enviamos um novo link. Veja também a pasta de spam.
        </Alerta>
      )}
      {resultado === 'erro' && (
        <Alerta intencao="atencao" titulo="Não foi possível reenviar">
          Aguarde um instante e tente de novo.
        </Alerta>
      )}

      {captcha.campo}
      <Botao variante="secundario" bloco disabled={restante > 0} onClick={() => void reenviar()}>
        {restante > 0 ? `Reenviar e-mail em ${contagem}` : 'Reenviar e-mail'}
      </Botao>
      <div className="tf-linha">
        <Botao variante="ghost" onClick={aoAlterarEmail}>
          Alterar e-mail
        </Botao>
        <BotaoLink to="/login" variante="ghost">
          Ir para entrar
        </BotaoLink>
      </div>
    </>
  )
}
