import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../shared/auth/useAuth'
import { Alerta } from '../shared/ui/Alerta'
import { Botao } from '../shared/ui/Botao'
import { TelaCarregando } from '../shared/ui/TelaCarregando'
import { useNivelMfa } from '../features/mfa/useNivelMfa'
import { useUsuarioAtual, type Usuario } from '../features/usuario/useUsuarioAtual'

type Perfil = Usuario['perfil']

/**
 * Decide só a navegação, em 3 estados: sem sessão (login), logado sem cadastro completo (completar cadastro)
 * e logado com perfil. Com autenticador cadastrado, exige o código nesta sessão; PROFISSIONAL precisa ter um
 * (as telas de MFA usam semMfa para não entrar em laço). Esconder telas é conforto: a regra de acesso de verdade fica na API (403/404).
 */
export function ProtectedRoute({ perfil, semMfa = false }: { perfil?: Perfil; semMfa?: boolean }) {
  const { sessao, carregando, sair } = useAuth()
  const usuario = useUsuarioAtual()
  const mfa = useNivelMfa()

  if (carregando) return <TelaCarregando />
  if (!sessao) return <Navigate to="/login" replace />
  if (usuario.isPending) return <TelaCarregando />

  if (usuario.isError) {
    return (
      <main id="conteudo" tabIndex={-1} className="tf-pagina">
        <Alerta
          intencao="atencao"
          titulo="Não foi possível carregar seus dados"
          acao={
            <div className="tf-linha">
              <Botao onClick={() => void usuario.refetch()}>Tentar de novo</Botao>
              <Botao variante="ghost" onClick={() => void sair()}>
                Sair
              </Botao>
            </div>
          }
        >
          O servidor pode estar iniciando e levar alguns minutos para responder. Aguarde um instante e tente de novo.
        </Alerta>
      </main>
    )
  }

  if (usuario.data === null) return <Navigate to="/completar-cadastro" replace />
  if (perfil && usuario.data.perfil !== perfil) return <Navigate to="/" replace />
  if (semMfa) return <Outlet />

  if (mfa?.proximo === 'aal2' && mfa.atual === 'aal1') return <Navigate to="/mfa/verificar" replace />
  if (usuario.data.perfil === 'PROFISSIONAL' && mfa?.proximo === 'aal1') {
    return <Navigate to="/mfa/ativar" replace />
  }
  return <Outlet />
}
