import { createBrowserRouter } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { InicioPage } from '../features/inicio/InicioPage'
import { ProtectedRoute } from '../shared/auth/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/', element: <InicioPage /> }],
  },
])
