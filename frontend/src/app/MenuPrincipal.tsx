import { DropdownMenu } from 'radix-ui'
import { Link, NavLink } from 'react-router'
import { ROTULO_PERFIL, useUsuarioAtual, type Usuario } from '../features/usuario/useUsuarioAtual'
import { useAuth } from '../shared/auth/useAuth'
import { IconePessoa, IconeSeta } from '../shared/ui/Icones'
import { Marca } from '../shared/ui/Marca'

type Aba = { rotulo: string; para: string; perfil?: Usuario['perfil'] }

/** Nomes, ordem e posição nunca mudam entre telas (Card 22). "Pacientes" entra com o Card 36, só para PROFISSIONAL. */
const ABAS: Aba[] = [
  { rotulo: 'Início', para: '/' },
  { rotulo: 'TENS', para: '/tens' },
  { rotulo: 'FES', para: '/fes' },
  { rotulo: 'Criar conteúdo', para: '/criar-conteudo' },
]

export function MenuPrincipal({ abas = ABAS }: { abas?: Aba[] }) {
  const { sair } = useAuth()
  const usuario = useUsuarioAtual().data

  return (
    <nav className="tf-menu" aria-label="Principal">
      <Marca />
      <ul className="tf-menu__lista">
        {abas
          .filter((aba) => !aba.perfil || aba.perfil === usuario?.perfil)
          .map((aba) => (
            <li key={aba.para}>
              <NavLink className="tf-menu__link" to={aba.para} end={aba.para === '/'}>
                {aba.rotulo}
              </NavLink>
            </li>
          ))}
      </ul>
      {usuario && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="tf-menu__conta">
            <IconePessoa />
            <span className="tf-menu__identidade">
              <span className="tf-menu__nome">{usuario.nome}</span>
              <span className="tf-menu__perfil">{ROTULO_PERFIL[usuario.perfil]}</span>
            </span>
            <IconeSeta className="tf-menu__seta" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="tf-menu__opcoes" align="end" sideOffset={8}>
              <DropdownMenu.Item className="tf-menu__opcao" asChild>
                <Link to="/perfil">Meu perfil</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="tf-menu__opcao" onSelect={() => void sair()}>
                Sair
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </nav>
  )
}
