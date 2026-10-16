import { createBrowserRouter, Navigate } from 'react-router'
import { AuthCallbackPage } from '../features/auth/login/AuthCallbackPage'
import { CompletarCadastroPage } from '../features/auth/cadastro/CompletarCadastroPage'
import { EsqueciSenhaPage } from '../features/auth/senha/EsqueciSenhaPage'
import { LoginPage } from '../features/auth/login/LoginPage'
import { PoliticaPrivacidadePage } from '../features/termos/PoliticaPrivacidadePage'
import { ProtectedRoute } from './ProtectedRoute'
import { TermosDeUsoPage } from '../features/termos/TermosDeUsoPage'
import { AceitarTermosPage } from '../features/termos/AceitarTermosPage'
import { AtivarMfaPage } from '../features/mfa/AtivarMfaPage'
import { VerificarMfaPage } from '../features/mfa/VerificarMfaPage'
import { FES } from '../features/fes/conteudoFes'
import { TENS } from '../features/tens/conteudoTens'
import { rotasDoModulo } from '../features/modulo/rotasDoModulo'
import { InicioPage } from '../features/inicio/InicioPage'
import { PerfilPage } from '../features/perfil/PerfilPage'
import { PacienteFormPage } from '../features/pacientes/PacienteFormPage'
import { PacientesPage } from '../features/pacientes/PacientesPage'
import { AvaliacaoFormPage } from '../features/avaliacao/AvaliacaoFormPage'
import { SimuladorPage } from '../features/simulador/SimuladorPage'
import { EmConstrucao } from './EmConstrucao'
import { LayoutLogado } from './LayoutLogado'
import { RaizApp } from './RaizApp'

function emConstrucao(path: string, titulo: string) {
  return { path, handle: { titulo }, element: <EmConstrucao titulo={titulo} /> }
}

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
          { path: '/termos/aceitar', handle: { titulo: 'Termos atualizados' }, element: <AceitarTermosPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <LayoutLogado />,
            children: [
              { path: '/', handle: { titulo: 'Início' }, element: <InicioPage /> },
              rotasDoModulo(TENS),
              rotasDoModulo(FES),
              { path: '/simulador', handle: { titulo: 'Simulador' }, element: <SimuladorPage /> },
              emConstrucao('/criar-conteudo', 'Criar conteúdo'),
              { path: '/perfil', handle: { titulo: 'Meu perfil' }, element: <PerfilPage /> },
              {
                element: <ProtectedRoute perfil="PROFISSIONAL" />,
                children: [
                  { path: '/pacientes', handle: { titulo: 'Pacientes' }, element: <PacientesPage /> },
                  { path: '/pacientes/novo', handle: { titulo: 'Novo paciente' }, element: <PacienteFormPage /> },
                  { path: '/pacientes/:id', handle: { titulo: 'Paciente' }, element: <PacienteFormPage /> },
                  { path: '/pacientes/:id/avaliacoes/nova', handle: { titulo: 'Avaliação inicial' }, element: <AvaliacaoFormPage /> },
                  { path: '/pacientes/:id/avaliacoes/:avaliacaoId', handle: { titulo: 'Avaliação' }, element: <AvaliacaoFormPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
