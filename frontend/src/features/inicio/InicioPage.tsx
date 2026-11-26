import { Link } from 'react-router'
import { BotaoLink } from '../../shared/ui/Botao'
import { FolhasDecorativas } from '../../shared/ui/FolhasDecorativas'
import { OndaFes, OndaTens } from '../../shared/ui/Icones'
import { FES } from '../fes/conteudoFes'
import { TENS } from '../tens/conteudoTens'
import { useUsuarioAtual, type Usuario } from '../usuario/useUsuarioAtual'

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

type Ferramenta = { titulo: string; resumo?: string; para: string; acao: string }

const SIMULADOR: Ferramenta = {
  titulo: 'Simulador',
  resumo: 'Combine frequência, largura de pulso e tempo e veja a forma de onda resultante.',
  para: '/simulador',
  acao: 'Abrir o simulador',
}

const ATLAS: Ferramenta = {
  titulo: 'Atlas de eletrodos',
  resumo: 'Pranchas com exemplos de posicionamento dos eletrodos por região do corpo.',
  para: `${TENS.base}/eletrodos`,
  acao: 'Abrir o atlas de eletrodos',
}

const DICIONARIO: Ferramenta = {
  titulo: 'Dicionário de parâmetros',
  resumo: 'O que cada ajuste do aparelho significa, com unidade e faixa educativa.',
  para: `${TENS.base}/parametros`,
  acao: 'Abrir o dicionário de parâmetros',
}

const BIBLIOTECA: Ferramenta = { titulo: 'Biblioteca digital', para: '/biblioteca', acao: 'Abrir a biblioteca' }

/** Atalhos por perfil (card "Criar tela Início por perfil"). Pacientes fica em "Prática clínica". */
const FERRAMENTAS: Record<Usuario['perfil'], Ferramenta[]> = {
  ESTUDANTE: [SIMULADOR, ATLAS, DICIONARIO, BIBLIOTECA],
  PROFISSIONAL: [SIMULADOR, ATLAS, BIBLIOTECA],
}

export function InicioPage() {
  const usuario = useUsuarioAtual().data
  const profissional = usuario?.perfil === 'PROFISSIONAL'
  const primeiroNome = usuario?.nome.split(' ')[0]
  const ferramentas = FERRAMENTAS[usuario?.perfil ?? 'ESTUDANTE']

  return (
    <div className="tf-pagina tf-inicio">
      <header className="tf-hero tf-on-deep">
        <FolhasDecorativas className="tf-hero__arte" />
        <div className="tf-hero__texto">
          {primeiroNome && <p className="tf-hero__kicker">Olá, {primeiroNome}</p>}
          <h1 className="tf-titulo" data-onboarding-titulo tabIndex={-1}>{profissional ? 'TENS e FES na prática clínica' : 'Aprenda TENS e FES'}</h1>
          <p className="tf-hero__sub">
            {profissional
              ? 'Acompanhe avaliações, sessões e a evolução de seus pacientes.'
              : 'Comece pelo objetivo e depois veja os ajustes.'}
          </p>
          <BotaoLink to={TENS.base} variante="primario">
            Começar pelo TENS
          </BotaoLink>
        </div>
      </header>

      {profissional && (
        <section className="tf-pilha" aria-labelledby="titulo-pratica">
          <h2 id="titulo-pratica" className="tf-titulo tf-titulo--secao">Prática clínica</h2>
          <div className="tf-cartao tf-modulo-cartao">
            <h3 className="tf-titulo tf-titulo--cartao">Pacientes</h3>
            <p className="tf-sub">Consulte prontuários e registre avaliações e sessões.</p>
            <Link className="tf-link tf-modulo-cartao__acao" to="/pacientes">Abrir pacientes</Link>
          </div>
        </section>
      )}

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

      <section className="tf-pilha" aria-labelledby="titulo-criar-conteudo">
        <h2 id="titulo-criar-conteudo" className="tf-titulo tf-titulo--secao">Crie seu conteúdo</h2>
        <div className="tf-cartao tf-pilha">
          <p className="tf-sub">Monte um material de estudo e organize o que você quer compartilhar.</p>
          <BotaoLink to="/criar-conteudo/novo" variante="primario">Criar material</BotaoLink>
        </div>
      </section>

      <section className="tf-pilha" aria-labelledby="titulo-ferramentas">
        <h2 id="titulo-ferramentas" className="tf-titulo tf-titulo--secao">
          Ferramentas
        </h2>
        <ul className="tf-lista-cartoes">
          {ferramentas.map((ferramenta) => (
            <li key={ferramenta.para} className="tf-cartao tf-modulo-cartao">
              <h3 className="tf-titulo tf-titulo--cartao">{ferramenta.titulo}</h3>
              {ferramenta.resumo && <p className="tf-sub">{ferramenta.resumo}</p>}
              <Link className="tf-link tf-modulo-cartao__acao" to={ferramenta.para}>
                {ferramenta.acao}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}