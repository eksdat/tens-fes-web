import { Outlet, useLocation } from 'react-router'
import { MenuPrincipal } from './MenuPrincipal'

import { EstadoDoAparelhoProvider } from '../features/aparelho/EstadoDoAparelhoProvider'
import { RegiaoToasts, ToastsProvider } from '../shared/ui/Toasts'
import { OnboardingProvider } from './Onboarding'

export function LayoutLogado() {
  const { pathname } = useLocation()

  return (
    <EstadoDoAparelhoProvider>
      <ToastsProvider>
        <OnboardingProvider>
          <div className="tf-app">
            <MenuPrincipal />
            <RegiaoToasts />
            <main id="conteudo" className="tf-app__conteudo" tabIndex={-1}>
              <div key={pathname} className="tf-pagina-entrada">
                <Outlet />
              </div>
            </main>
          </div>
        </OnboardingProvider>
      </ToastsProvider>
    </EstadoDoAparelhoProvider>
  )
}
