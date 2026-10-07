import { Outlet } from 'react-router'
import { MenuPrincipal } from './MenuPrincipal'

export function LayoutLogado() {
  return (
    <div className="tf-app">
      <MenuPrincipal />
      <main id="conteudo" className="tf-app__conteudo" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
