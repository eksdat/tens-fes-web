import { DropdownMenu } from 'radix-ui'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { ROTULO_PERFIL, useUsuarioAtual } from '../features/usuario/useUsuarioAtual'
import { BotaoAcessibilidade } from '../shared/acessibilidade/BotaoAcessibilidade'
import { useAuth } from '../shared/auth/useAuth'
import {
  IconeCriar,
  IconeFes,
  IconeInicio,
  IconePacientes,
  IconePessoa,
  IconeSeta,
  IconeTens,
} from '../shared/ui/Icones'
import { Marca } from '../shared/ui/Marca'
import { ABAS, type Aba } from './abas'
import { BuscaRapida } from './BuscaRapida'

const ICONES: Record<string, ReactNode> = {
  '/': <IconeInicio />,
  '/tens': <IconeTens />,
  '/fes': <IconeFes />,
  '/criar-conteudo': <IconeCriar />,
  '/pacientes': <IconePacientes />,
}

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
                {ICONES[aba.para]}
                <span>{aba.rotulo}</span>
              </NavLink>
            </li>
          ))}
      </ul>
      <div className="tf-menu__acoes">
        <BuscaRapida perfil={usuario?.perfil} aoSair={() => void sair()} />
        <BotaoAcessibilidade />
        {usuario && (
        <DropdownMenu.Root modal={false}>
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
      </div>
    </nav>
  )
}
