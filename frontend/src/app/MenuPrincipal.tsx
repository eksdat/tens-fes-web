import { NavLink } from 'react-router'
import { useUsuarioAtual, type Usuario } from '../features/usuario/useUsuarioAtual'
import { useAuth } from '../shared/auth/useAuth'
import { Botao } from '../shared/ui/Botao'
import { Marca } from '../shared/ui/Marca'

type Aba = { rotulo: string; para: string; perfil?: Usuario['perfil'] }

/** Nomes, ordem e posição nunca mudam entre telas. Cada card de tela nova acrescenta a sua aba, na ordem do Card 22. */
const ABAS: Aba[] = [{ rotulo: 'Início', para: '/' }]

export function MenuPrincipal({ abas = ABAS }: { abas?: Aba[] }) {
  const { sair } = useAuth()
  const perfil = useUsuarioAtual().data?.perfil

  return (
    <nav className="tf-menu" aria-label="Principal">
      <Marca />
      <ul className="tf-menu__lista">
        {abas
          .filter((aba) => !aba.perfil || aba.perfil === perfil)
          .map((aba) => (
            <li key={aba.para}>
              <NavLink className="tf-menu__link" to={aba.para} end={aba.para === '/'}>
                {aba.rotulo}
              </NavLink>
            </li>
          ))}
      </ul>
      <Botao variante="ghost" onClick={() => void sair()}>
        Sair
      </Botao>
    </nav>
  )
}
