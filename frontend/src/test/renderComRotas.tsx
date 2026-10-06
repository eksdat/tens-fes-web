import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes } from 'react-router'

export function renderComRotas(rotas: ReactNode, rotaInicial: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[rotaInicial]}>
        <Routes>{rotas}</Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
