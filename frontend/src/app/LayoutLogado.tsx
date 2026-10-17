import { Outlet, useLocation } from 'react-router'
import { MenuPrincipal } from './MenuPrincipal'
import { RegiaoToasts, ToastsProvider } from '../shared/ui/Toasts'

export function LayoutLogado() {
  const { pathname } = useLocation()

  return (
    <ToastsProvider>
      <div className="tf-app">
        <MenuPrincipal />
        <RegiaoToasts />
        <main id="conteudo" className="tf-app__conteudo" tabIndex={-1}>
          <div key={pathname} className="tf-pagina-entrada">
            <Outlet />
          </div>
        </main>
      </div>
    </ToastsProvider>
  )
}
