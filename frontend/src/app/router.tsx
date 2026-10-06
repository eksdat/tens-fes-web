import { createBrowserRouter, Navigate } from 'react-router'
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage'
import { CompletarCadastroPage } from '../features/auth/CompletarCadastroPage'
import { EsqueciSenhaPage } from '../features/auth/EsqueciSenhaPage'
import { LoginPage } from '../features/auth/LoginPage'
import { PoliticaPrivacidadePage } from '../features/legal/PoliticaPrivacidadePage'
import { ProtectedRoute } from '../shared/auth/ProtectedRoute'
import { TermosDeUsoPage } from '../features/legal/TermosDeUsoPage'
import { AtivarMfaPage } from '../features/mfa/AtivarMfaPage'
import { VerificarMfaPage } from '../features/mfa/VerificarMfaPage'
import { InicioPage } from '../features/inicio/InicioPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // Carregadas sob demanda: o zxcvbn-ts (checagem de senha fraca) pesa ~1 MB e só estas telas usam.
  { path: '/cadastro', lazy: async () => ({ Component: (await import('../features/auth/CadastroPage')).CadastroPage }) },
  { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
  { path: '/nova-senha', lazy: async () => ({ Component: (await import('../features/auth/NovaSenhaPage')).NovaSenhaPage }) },
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
