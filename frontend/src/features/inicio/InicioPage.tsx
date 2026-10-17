import { Link } from 'react-router'
import { BotaoLink } from '../../shared/ui/Botao'
import { FolhasDecorativas } from '../../shared/ui/FolhasDecorativas'
import { OndaFes, OndaTens } from '../../shared/ui/Icones'
import { FES } from '../fes/conteudoFes'
import { TENS } from '../tens/conteudoTens'
import { useUsuarioAtual } from '../usuario/useUsuarioAtual'

const MODULOS = [
  {
    sigla: 'TENS',
    numero: TENS.numero,
    titulo: TENS.titulo,
    resumo: 'Fundamentos, modos do aparelho e exemplos de posicionamento.',
    para: TENS.base,
    onda: <OndaTens />,
  },
  {
    sigla: 'FES',
    numero: FES.numero,
    titulo: FES.titulo,
    resumo: 'Alvos, ajustes e relação entre estimulação e tarefa.',
    para: FES.base,
    onda: <OndaFes />,
  },
]

export function InicioPage() {
  const usuario = useUsuarioAtual().data
  const primeiroNome = usuario?.nome.split(' ')[0]

  return (
    <div className="tf-pagina tf-inicio">
      <header className="tf-hero tf-on-deep">
        <FolhasDecorativas className="tf-hero__arte" />
        <div className="tf-hero__texto">
          {primeiroNome && <p className="tf-hero__kicker">Olá, {primeiroNome}</p>}
          <h1 className="tf-titulo">Aprenda TENS e FES</h1>
          <p className="tf-hero__sub">Comece pelo objetivo e depois veja os ajustes.</p>
          <BotaoLink to={TENS.base} variante="primario">
            Começar pelo TENS
          </BotaoLink>
        </div>
      </header>

      <section className="tf-pilha" aria-labelledby="titulo-modulos">
        <h2 id="titulo-modulos" className="tf-titulo tf-titulo--secao">
          Módulos
        </h2>
        <ul className="tf-lista-cartoes">
          {MODULOS.map((modulo) => (
            <li key={modulo.sigla} className="tf-cartao tf-modulo-cartao">
              <span className={`tf-etiqueta tf-etiqueta--${modulo.sigla.toLowerCase()}`}>
                {modulo.onda}
                {modulo.sigla}
              </span>
              <p className="tf-modulo__kicker">Módulo {modulo.numero}</p>
              <h3 className="tf-titulo tf-titulo--cartao">{modulo.titulo}</h3>
              <p className="tf-sub">{modulo.resumo}</p>
              <Link className="tf-link tf-modulo-cartao__acao" to={modulo.para}>
                Estudar {modulo.sigla}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha" aria-labelledby="titulo-ferramentas">
        <h2 id="titulo-ferramentas" className="tf-titulo tf-titulo--secao">
          Ferramentas
        </h2>
        <ul className="tf-lista-cartoes">
          <li className="tf-cartao tf-modulo-cartao">
            <h3 className="tf-titulo tf-titulo--cartao">Simulador</h3>
            <p className="tf-sub">Combine frequência, largura de pulso e tempo e veja a forma de onda resultante.</p>
            <Link className="tf-link tf-modulo-cartao__acao" to="/simulador">
              Abrir o simulador
            </Link>
          </li>
        </ul>
      </section>

      <div className="tf-linha">
        <BotaoLink to="/mfa/ativar" variante="ghost">
          Verificação em duas etapas
        </BotaoLink>
      </div>
    </div>
  )
}
