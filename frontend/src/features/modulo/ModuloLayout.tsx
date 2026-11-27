import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { ABAS_MODULO } from './abasModulo'
import type { Modulo } from './tipos'

export function ModuloLayout({ modulo }: { modulo: Modulo }) {
  const navegar = useNavigate()
  return (
    <section className="tf-pagina tf-modulo">
      <header className="tf-pilha">
        <div className="tf-modulo__kicker tf-modulo__entrada">
          <Link className="tf-link tf-modulo__voltar" to="/" aria-label="Voltar" onClick={(evento) => {
            if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
            if (window.history.state?.idx > 0) {
              evento.preventDefault()
              void navegar(-1)
            }
          }}>
            <span aria-hidden="true">←</span>
          </Link>
          <span>
            Módulo {modulo.numero} · {modulo.sigla}
          </span>
        </div>
        <h1 className="tf-titulo">{modulo.titulo}</h1>
        <p className="tf-sub">{modulo.introducao}</p>
        <Link className="tf-link" to={modulo.sigla === 'FES' ? '/biblioteca?modalidade=NMES%2FFES' : '/biblioteca?modalidade=TENS'}>
          Biblioteca
        </Link>
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
