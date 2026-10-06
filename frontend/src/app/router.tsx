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
import { LayoutLogado } from './LayoutLogado'
import { RaizApp } from './RaizApp'

export const router = createBrowserRouter([
  {
    element: <RaizApp />,
    children: [
      { path: '/login', handle: { titulo: 'Entrar' }, element: <LoginPage /> },
      {
        path: '/cadastro',
        handle: { titulo: 'Criar conta' },
        lazy: async () => ({ Component: (await import('../features/auth/cadastro/CadastroPage')).CadastroPage }),
      },
      { path: '/esqueci-senha', handle: { titulo: 'Recuperar senha' }, element: <EsqueciSenhaPage /> },
      {
        path: '/nova-senha',
        handle: { titulo: 'Nova senha' },
        lazy: async () => ({ Component: (await import('../features/auth/senha/NovaSenhaPage')).NovaSenhaPage }),
      },
      { path: '/auth/callback', handle: { titulo: 'Entrando' }, element: <AuthCallbackPage /> },
      { path: '/completar-cadastro', handle: { titulo: 'Completar cadastro' }, element: <CompletarCadastroPage /> },
      { path: '/termos', handle: { titulo: 'Termos de uso' }, element: <TermosDeUsoPage /> },
      { path: '/privacidade', handle: { titulo: 'Política de privacidade' }, element: <PoliticaPrivacidadePage /> },
      {
        element: <ProtectedRoute semMfa />,
        children: [
          { path: '/mfa/ativar', handle: { titulo: 'Ativar verificação em duas etapas' }, element: <AtivarMfaPage /> },
          { path: '/mfa/verificar', handle: { titulo: 'Verificar código' }, element: <VerificarMfaPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <LayoutLogado />,
            children: [{ path: '/', handle: { titulo: 'Início' }, element: <InicioPage /> }],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
