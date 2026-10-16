import { Outlet, useLocation } from 'react-router'
import { MenuPrincipal } from './MenuPrincipal'

import { EstadoDoAparelhoProvider } from '../features/aparelho/EstadoDoAparelhoProvider'

export function LayoutLogado() {
  const { pathname } = useLocation()

  return (
    <EstadoDoAparelhoProvider>
      <div className="tf-app">
        <MenuPrincipal />
        <main id="conteudo" className="tf-app__conteudo" tabIndex={-1}>
          <div key={pathname} className="tf-pagina-entrada">
            <Outlet />
          </div>
        </main>
      </div>
    </EstadoDoAparelhoProvider>
  )
}
