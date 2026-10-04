import { createBrowserRouter, Navigate } from 'react-router'
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage'
import { CadastroPage } from '../features/auth/CadastroPage'
import { CompletarCadastroPage } from '../features/auth/CompletarCadastroPage'
import { EsqueciSenhaPage } from '../features/auth/EsqueciSenhaPage'
import { LoginPage } from '../features/auth/LoginPage'
import { NovaSenhaPage } from '../features/auth/NovaSenhaPage'
import { PoliticaPrivacidadePage } from '../features/auth/PoliticaPrivacidadePage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { TermosDeUsoPage } from '../features/auth/TermosDeUsoPage'
import { AtivarMfaPage } from '../features/mfa/AtivarMfaPage'
import { VerificarMfaPage } from '../features/mfa/VerificarMfaPage'
import { InicioPage } from '../features/inicio/InicioPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <CadastroPage /> },
  { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
  { path: '/nova-senha', element: <NovaSenhaPage /> },
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
