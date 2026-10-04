import { useAuth } from '../../shared/auth/useAuth'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { Marca } from '../../shared/ui/Marca'
import { useUsuarioAtual } from '../usuario/useUsuarioAtual'

const PERFIL = { ESTUDANTE: 'Estudante', PROFISSIONAL: 'Profissional' } as const

/** Provisória: a tela inicial de verdade vem com os módulos TENS e FES. */
export function InicioPage() {
  const { sair } = useAuth()
  const usuario = useUsuarioAtual().data

  return (
    <main className="tf-pagina">
      <Marca />
      <h1 className="tf-titulo">Olá, {usuario?.nome}</h1>
      <p className="tf-sub">Perfil: {usuario ? PERFIL[usuario.perfil] : ''}. Esta tela está em construção.</p>
      <div className="tf-linha">
        <BotaoLink to="/mfa/ativar" variante="secundario">
          Verificação em duas etapas
        </BotaoLink>
        <Botao variante="secundario" onClick={() => void sair()}>
          Sair
        </Botao>
      </div>
    </main>
  )
}
