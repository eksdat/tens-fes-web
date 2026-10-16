import { NavLink, Outlet } from 'react-router'
import { ABAS_MODULO } from './abasModulo'
import type { Modulo } from './tipos'

export function ModuloLayout({ modulo }: { modulo: Modulo }) {
  return (
    <section className="tf-pagina tf-modulo">
      <header className="tf-pilha">
        <p className="tf-modulo__kicker">
          Módulo {modulo.numero} · {modulo.sigla}
        </p>
        <h1 className="tf-titulo">{modulo.titulo}</h1>
        <p className="tf-sub">{modulo.introducao}</p>
      </header>

      <nav aria-label={`Seções de ${modulo.sigla}`}>
        <ul className="tf-abas">
          {ABAS_MODULO.map((aba) => (
            <li key={aba.rotulo}>
              <NavLink
                className="tf-abas__link"
                to={aba.caminho ? `${modulo.base}/${aba.caminho}` : modulo.base}
                end
              >
                {aba.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </section>
  )
}
