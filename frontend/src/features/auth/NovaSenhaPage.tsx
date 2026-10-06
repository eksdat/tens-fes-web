import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { supabase } from '../../shared/api/supabase'
import { useAuth } from '../../shared/auth/useAuth'
import { Alerta } from '../../shared/ui/Alerta'
import { AuthLayout } from '../../shared/ui/AuthLayout'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { CampoSenha } from '../../shared/ui/CampoSenha'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'
import { CampoCodigo } from '../mfa/CampoCodigo'
import { codigoSchema } from '../mfa/codigoSchema'
import { useNivelMfa } from '../mfa/useNivelMfa'
import { verificarCodigo } from '../mfa/verificarCodigo'
import { dadosPessoais, MENSAGEM_SENHA_FACIL, senhaFacilDeAdivinhar } from './forcaSenha'
import { RequisitosSenha } from './RequisitosSenha'
import { senhaNovaSchema } from './schemas'

function criarSchema(dados: string[]) {
  return z
    .object({
      senha: senhaNovaSchema,
      confirmacao: z.string().min(1, 'Confirme a senha'),
      codigo: z.string(),
    })
    .superRefine((v, ctx) => {
      if (v.senha !== v.confirmacao) {
        ctx.addIssue({ code: 'custom', path: ['confirmacao'], message: 'As senhas não coincidem' })
      }
      if (senhaNovaSchema.safeParse(v.senha).success && senhaFacilDeAdivinhar(v.senha, dados)) {
        ctx.addIssue({ code: 'custom', path: ['senha'], message: MENSAGEM_SENHA_FACIL })
      }
    })
}

type Form = z.infer<ReturnType<typeof criarSchema>>

type Resultado = 'ok' | 'igual' | 'codigo' | 'erro' | null

/**
 * Abre pelo link de redefinição do e-mail: o supabase-js transforma o link em uma sessão temporária.
 * Quem tem autenticador precisa digitar o código antes: o Supabase só troca a senha em sessão aal2.
 */
export function NovaSenhaPage() {
  const { sessao, carregando } = useAuth()
  const nivel = useNivelMfa()
  const [resultado, setResultado] = useState<Resultado>(null)
  const email = sessao?.user?.email ?? ''
  const dados = useMemo(() => dadosPessoais('', email), [email])
  const schema = useMemo(() => criarSchema(dados), [dados])
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { codigo: '' } })

  const senha = useWatch({ control, name: 'senha' }) ?? ''
  const fatorPendente = nivel?.atual === 'aal1' ? nivel.fatorId : undefined

  if (carregando) return <TelaCarregando />

  async function salvar({ senha, codigo }: Form) {
    setResultado(null)
    if (fatorPendente) {
      const lido = codigoSchema.shape.codigo.safeParse(codigo)
      if (!lido.success) return setError('codigo', { message: lido.error.issues[0].message })
      const verificado = await verificarCodigo(fatorPendente, lido.data)
      if (verificado !== 'ok') return setResultado(verificado === 'codigo' ? 'codigo' : 'erro')
    }

    const { error } = await supabase.auth.updateUser({ password: senha })
    if (!error) return setResultado('ok')
    setResultado(error.code === 'same_password' ? 'igual' : 'erro')
  }

  return (
    <AuthLayout
      voltarPara="/login"
      kicker="Recuperar acesso"
      titulo="Crie uma nova senha"
      texto="Escolha uma senha forte e que você não use em outros sites."
    >
      <div className="tf-pilha">
        <h1 className="tf-titulo">Nova senha</h1>
      </div>

      {!sessao && (
        <>
          <Alerta intencao="perigo" titulo="Link inválido ou expirado">
            O link de redefinição vale por 1 hora e só pode ser usado uma vez. Peça um novo.
          </Alerta>
          <BotaoLink to="/esqueci-senha" variante="primario" bloco>
            Pedir um novo link
          </BotaoLink>
        </>
      )}

      {sessao && resultado === 'ok' && (
        <>
          <Alerta intencao="sucesso" titulo="Senha alterada">
            Pronto. Você já está com a nova senha.
          </Alerta>
          <BotaoLink to="/" variante="primario" bloco>
            Continuar
          </BotaoLink>
        </>
      )}

      {sessao && resultado !== 'ok' && (
        <>
          {resultado === 'igual' && (
            <Alerta intencao="atencao" titulo="Escolha outra senha">
              A nova senha não pode ser igual à senha atual.
            </Alerta>
          )}
          {resultado === 'codigo' && (
            <Alerta intencao="perigo" titulo="Código incorreto ou vencido">
              Confira o aplicativo autenticador e tente de novo.
            </Alerta>
          )}
          {resultado === 'erro' && (
            <Alerta intencao="perigo" titulo="Não foi possível salvar">
              Tente de novo em instantes. Se continuar, peça um novo link.
            </Alerta>
          )}
          <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(salvar)(e)}>
            <CampoSenha
              rotulo="Nova senha"
              autoComplete="new-password"
              erro={errors.senha?.message}
              {...register('senha')}
            />
            <RequisitosSenha senha={senha} dados={dados} />
            <p className="tf-field__hint">A nova senha não pode ser igual à senha atual. Conferimos ao salvar.</p>
            <CampoSenha
              rotulo="Confirme a nova senha"
              autoComplete="new-password"
              erro={errors.confirmacao?.message}
              {...register('confirmacao')}
            />
            {fatorPendente && (
              <>
                <p className="tf-sub">Sua conta tem verificação em duas etapas. Informe o código do aplicativo para trocar a senha.</p>
                <Controller
                  control={control}
                  name="codigo"
                  render={({ field }) => <CampoCodigo onChange={field.onChange} erro={errors.codigo?.message} />}
                />
              </>
            )}
            <Botao type="submit" bloco carregando={isSubmitting}>
              Salvar nova senha
            </Botao>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
