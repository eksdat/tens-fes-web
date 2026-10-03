import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './AuthContext'
import type { Sessao } from './sessaoStorage'
import { ProtectedRoute } from './ProtectedRoute'

function renderizarEm(rota: string, sessao: Sessao | null) {
  if (sessao) localStorage.setItem('fisiotech.sessao', JSON.stringify(sessao))
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[rota]}>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>tela inicial</p>} />
          </Route>
          <Route element={<ProtectedRoute perfil="PROFISSIONAL" />}>
            <Route path="/pacientes" element={<p>tela de pacientes</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

const estudante: Sessao = { token: 't', nome: 'Ana', perfil: 'ESTUDANTE' }
const profissional: Sessao = { token: 't', nome: 'Bia', perfil: 'PROFISSIONAL' }

test('deveRedirecionarParaLoginSemSessao', () => {
  renderizarEm('/', null)
  expect(screen.getByText('tela de login')).toBeInTheDocument()
})

test('deveRedirecionarEstudanteQueTentaAbrirPacientes', () => {
  renderizarEm('/pacientes', estudante)
  expect(screen.getByText('tela inicial')).toBeInTheDocument()
})

test('devePermitirProfissionalEmPacientes', () => {
  renderizarEm('/pacientes', profissional)
  expect(screen.getByText('tela de pacientes')).toBeInTheDocument()
})
