import { Navigate } from 'react-router'
import { useAuth } from '../../../shared/auth/useAuth'
import { Alerta } from '../../../shared/ui/Alerta'
import { AuthLayout } from '../../../shared/ui/AuthLayout'
import { BotaoLink } from '../../../shared/ui/Botao'
import { TelaCarregando } from '../../../shared/ui/TelaCarregando'

/**
 * Destino do link de confirmação do e-mail e da volta do Google. O supabase-js lê o endereço e abre a sessão; daqui, a rota protegida
 * decide o resto (perfil existente: início; sem cadastro completo: completar cadastro).
 */
export function AuthCallbackPage() {
  const { sessao, carregando } = useAuth()

  if (carregando) return <TelaCarregando />
  if (sessao) return <Navigate to="/" replace />

  return (
    <AuthLayout voltarPara="/login" kicker="Confirmação" titulo="Não deu para concluir" texto="O link pode ter expirado ou o acesso pelo Google não foi autorizado.">
      <div className="tf-pilha">
        <h1 className="tf-titulo">Não foi possível concluir</h1>
      </div>
      <Alerta intencao="perigo" titulo="Link inválido, expirado ou acesso negado">
        O link de confirmação vale por 1 hora e só pode ser usado uma vez. Se você cancelou o acesso pelo Google, tente
        de novo. Entre com seu e-mail e senha: se a conta ainda não foi confirmada, oferecemos reenviar o link.
      </Alerta>
      <BotaoLink to="/login" variante="primario" bloco>
        Ir para entrar
      </BotaoLink>
    </AuthLayout>
  )
}
