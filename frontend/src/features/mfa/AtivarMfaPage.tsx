import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { supabase } from '../../shared/api/supabase'
import { useAuth } from '../../shared/auth/useAuth'
import { Alerta } from '../../shared/ui/Alerta'
import { AuthLayout } from '../../shared/ui/AuthLayout'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { TelaCarregando } from '../../shared/ui/TelaCarregando'
import { useUsuarioAtual } from '../usuario/useUsuarioAtual'
import { CampoCodigo } from './CampoCodigo'
import { codigoSchema, type CodigoForm } from './codigoSchema'
import { MENSAGEM_CODIGO_ERRADO, verificarCodigo } from './verificarCodigo'

type Estado =
  | { fase: 'preparando' }
  | { fase: 'configurando'; fatorId: string; qr: string; segredo: string }
  | { fase: 'ativa'; fatorId: string }
  | { fase: 'falhou' }

/**
 * Ativa o autenticador (TOTP). Fatores iniciados e nunca confirmados são removidos antes de criar um novo:
 * o Supabase recusa dois fatores com o mesmo nome. Desativar ou trocar de aparelho exige o código do aplicativo
 * atual, mesmo com a sessão já em aal2: quem pegar o computador desbloqueado não consegue tirar a proteção.
 */
export function AtivarMfaPage() {
  const { sair } = useAuth()
  const usuario = useUsuarioAtual().data
  const navigate = useNavigate()
  const [estado, setEstado] = useState<Estado>({ fase: 'preparando' })
  const [erro, setErro] = useState<string | null>(null)
  const [acao, setAcao] = useState<'desativar' | 'trocar' | null>(null)
  const iniciou = useRef(false)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CodigoForm>({ resolver: zodResolver(codigoSchema), defaultValues: { codigo: '' } })

  async function preparar() {
    const { data: fatores, error } = await supabase.auth.mfa.listFactors()
    if (error) return setEstado({ fase: 'falhou' })

    const ativo = fatores.totp[0]
    if (ativo) return setEstado({ fase: 'ativa', fatorId: ativo.id })

    const pendentes = fatores.all.filter((f) => f.factor_type === 'totp' && f.status === 'unverified')
    await Promise.all(pendentes.map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })))
    const { data, error: erroCadastro } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Fisiotech',
      issuer: 'Fisiotech',
    })
    if (erroCadastro) return setEstado({ fase: 'falhou' })
    setEstado({ fase: 'configurando', fatorId: data.id, qr: data.totp.qr_code, segredo: data.totp.secret })
  }

  useEffect(() => {
    if (iniciou.current) return
    iniciou.current = true
    void preparar()
  }, [])

  async function confirmar({ codigo }: CodigoForm) {
    if (estado.fase !== 'configurando') return
    setErro(null)
    const resultado = await verificarCodigo(estado.fatorId, codigo)
    if (resultado !== 'ok') {
      return setErro(resultado === 'codigo' ? MENSAGEM_CODIGO_ERRADO : 'Não foi possível confirmar agora. Tente de novo em instantes.')
    }
    setEstado({ fase: 'ativa', fatorId: estado.fatorId })
  }

  function cancelarAcao() {
    setAcao(null)
    setErro(null)
    reset()
  }

  async function confirmarAcao({ codigo }: CodigoForm) {
    if (estado.fase !== 'ativa' || !acao) return
    setErro(null)
    const resultado = await verificarCodigo(estado.fatorId, codigo)
    if (resultado !== 'ok') {
      return setErro(resultado === 'codigo' ? MENSAGEM_CODIGO_ERRADO : 'Não foi possível confirmar agora. Tente de novo em instantes.')
    }
    const { error } = await supabase.auth.mfa.unenroll({ factorId: estado.fatorId })
    if (error) return setErro('Não foi possível concluir agora. Tente de novo em instantes.')
    // unenroll não emite evento de sessão: renovar traz a lista de fatores atualizada para o AuthProvider.
    await supabase.auth.refreshSession()
    if (acao === 'desativar') return navigate('/', { replace: true })
    cancelarAcao()
    setEstado({ fase: 'preparando' })
    void preparar()
  }

  if (estado.fase === 'preparando') return <TelaCarregando />

  const obrigatorio = usuario?.perfil === 'PROFISSIONAL'

  return (
    <AuthLayout
      {...(obrigatorio ? { aoVoltar: () => void sair() } : { voltarPara: '/' })}
      kicker="Segurança da conta"
      titulo="Verificação em duas etapas"
      texto="Além da senha, o acesso pede um código do aplicativo autenticador do seu celular."
    >
      <div className="tf-pilha">
        <h1 className="tf-titulo">Verificação em duas etapas</h1>
        {obrigatorio && estado.fase !== 'ativa' && (
          <p className="tf-sub">Para profissionais, este passo é obrigatório antes de usar a plataforma.</p>
        )}
      </div>

      {erro && (
        <Alerta intencao="perigo" titulo="Algo deu errado">
          {erro}
        </Alerta>
      )}

      {estado.fase === 'falhou' && (
        <Alerta intencao="atencao" titulo="Não foi possível preparar a verificação">
          Recarregue a página e tente de novo.
        </Alerta>
      )}

      {estado.fase === 'configurando' && (
        <>
          <ol className="tf-passos">
            <li>Instale um aplicativo autenticador (Google Authenticator, Microsoft Authenticator, Authy ou similar).</li>
            <li>Escaneie o QR code abaixo. Se não conseguir, digite a chave manualmente.</li>
            <li>Informe o código de 6 dígitos que o aplicativo mostrar.</li>
          </ol>
          <img className="tf-qr" src={estado.qr} alt="QR code para cadastrar o Fisiotech no aplicativo autenticador" />
          <p className="tf-sub">
            Chave manual: <code className="tf-segredo">{estado.segredo}</code>
          </p>
          <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(confirmar)(e)}>
            <Controller
              control={control}
              name="codigo"
              render={({ field }) => <CampoCodigo onChange={field.onChange} erro={errors.codigo?.message} />}
            />
            <Botao type="submit" bloco carregando={isSubmitting}>
              Ativar verificação
            </Botao>
          </form>
        </>
      )}

      {estado.fase === 'ativa' && (
        <>
          <Alerta intencao="sucesso" titulo="Verificação em duas etapas ativa">
            No próximo login, depois da senha, o Fisiotech vai pedir o código do aplicativo.
          </Alerta>
          {!acao && (
            <>
              <BotaoLink to="/" variante="primario" bloco>
                Continuar
              </BotaoLink>
              <div className="tf-linha">
                <Botao variante="ghost" onClick={() => setAcao('trocar')}>
                  Trocar de aparelho
                </Botao>
                {!obrigatorio && (
                  <Botao variante="ghost" onClick={() => setAcao('desativar')}>
                    Desativar verificação
                  </Botao>
                )}
              </div>
            </>
          )}
          {acao && (
            <form className="tf-pilha" noValidate onSubmit={(e) => void handleSubmit(confirmarAcao)(e)}>
              <p className="tf-sub">
                {acao === 'desativar'
                  ? 'Para desativar, confirme com o código atual do aplicativo autenticador.'
                  : 'Para trocar de aparelho, confirme com o código atual. Depois você escaneia o QR code no aparelho novo.'}
              </p>
              <Controller
                control={control}
                name="codigo"
                render={({ field }) => <CampoCodigo onChange={field.onChange} erro={errors.codigo?.message} />}
              />
              <Botao type="submit" bloco carregando={isSubmitting}>
                {acao === 'desativar' ? 'Confirmar e desativar' : 'Confirmar e trocar'}
              </Botao>
              <Botao variante="ghost" onClick={cancelarAcao}>
                Cancelar
              </Botao>
            </form>
          )}
        </>
      )}
    </AuthLayout>
  )
}
