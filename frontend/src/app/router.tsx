import { createBrowserRouter, Navigate } from 'react-router'
import { AuthCallbackPage } from '../features/auth/login/AuthCallbackPage'
import { CompletarCadastroPage } from '../features/auth/cadastro/CompletarCadastroPage'
import { EsqueciSenhaPage } from '../features/auth/senha/EsqueciSenhaPage'
import { LoginPage } from '../features/auth/login/LoginPage'
import { PoliticaPrivacidadePage } from '../features/termos/PoliticaPrivacidadePage'
import { ProtectedRoute } from './ProtectedRoute'
import { TermosDeUsoPage } from '../features/termos/TermosDeUsoPage'
import { AtivarMfaPage } from '../features/mfa/AtivarMfaPage'
import { VerificarMfaPage } from '../features/mfa/VerificarMfaPage'
import { InicioPage } from '../features/inicio/InicioPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', lazy: async () => ({ Component: (await import('../features/auth/cadastro/CadastroPage')).CadastroPage }) },
  { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
  { path: '/nova-senha', lazy: async () => ({ Component: (await import('../features/auth/senha/NovaSenhaPage')).NovaSenhaPage }) },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/completar-cadastro', element: <CompletarCadastroPage /> },
  { path: '/termos', element: <TermosDeUsoPage /> },
  { path: '/privacidade', element: <PoliticaPrivacidadePage /> },
  {
    element: <ProtectedRoute semMfa />,
    children: [
      { path: '/mfa/ativar', element: <AtivarMfaPage /> },
      { path: '/mfa/verificar', element: <VerificarMfaPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/', element: <InicioPage /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
