import { Navigate, Outlet } from 'react-router'
import type { Perfil } from './sessaoStorage'
import { useAuth } from './useAuth'

// Só esconde a interface. A regra de acesso real fica no backend.
export function ProtectedRoute({ perfil }: { perfil?: Perfil }) {
  const { sessao } = useAuth()
  if (!sessao) return <Navigate to="/login" replace />
  if (perfil && sessao.perfil !== perfil) return <Navigate to="/" replace />
  return <Outlet />
}
