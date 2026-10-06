import { BotaoLink } from '../../shared/ui/Botao'
import { useUsuarioAtual } from '../usuario/useUsuarioAtual'

const PERFIL = { ESTUDANTE: 'Estudante', PROFISSIONAL: 'Profissional' } as const

/** Provisória: a tela inicial de verdade vem com os módulos TENS e FES. */
export function InicioPage() {
  const usuario = useUsuarioAtual().data

  return (
    <section className="tf-pagina">
      <h1 className="tf-titulo">Olá, {usuario?.nome}</h1>
      <p className="tf-sub">Perfil: {usuario ? PERFIL[usuario.perfil] : ''}. Esta tela está em construção.</p>
      <div className="tf-linha">
        <BotaoLink to="/mfa/ativar" variante="secundario">
          Verificação em duas etapas
        </BotaoLink>
      </div>
    </section>
  )
}
