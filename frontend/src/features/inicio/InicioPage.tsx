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

type Atalho = { titulo: string; resumo: string; para: string; acao: string }

const SIMULADOR: Atalho = {
  titulo: 'Simulador',
  resumo: 'Combine frequência, largura de pulso e tempo e veja a forma de onda resultante.',
  para: '/simulador',
  acao: 'Abrir o simulador',
}

const ATLAS: Atalho = {
  titulo: 'Atlas de eletrodos',
  resumo: 'Pranchas com exemplos de posicionamento dos eletrodos por região do corpo.',
  para: `${TENS.base}/eletrodos`,
  acao: 'Abrir o atlas de eletrodos',
}

const DICIONARIO: Atalho = {
  titulo: 'Dicionário de parâmetros',
  resumo: 'O que cada ajuste do aparelho significa, com unidade e faixa educativa.',
  para: `${TENS.base}/parametros`,
  acao: 'Abrir o dicionário de parâmetros',
}

const PACIENTES: Atalho = {
  titulo: 'Pacientes',
  resumo: 'Cadastre pacientes fictícios e registre avaliações e sessões.',
  para: '/pacientes',
  acao: 'Abrir a lista de pacientes',
}

/** TENS e FES já aparecem em "Módulos"; aqui ficam os outros atalhos de cada perfil (card "Criar tela Início por perfil"). */
const ATALHOS: Record<Usuario['perfil'], Atalho[]> = {
  ESTUDANTE: [SIMULADOR, ATLAS, DICIONARIO],
  PROFISSIONAL: [PACIENTES, ATLAS],
}

/** Texto e ação principal do destaque. O título é o mesmo nos dois perfis. */
const DESTAQUE: Record<Usuario['perfil'], { sub: string; para: string; acao: string }> = {
  ESTUDANTE: { sub: 'Comece pelo objetivo e depois veja os ajustes.', para: TENS.base, acao: 'Começar pelo TENS' },
  PROFISSIONAL: {
    sub: 'Consulte o conteúdo técnico e registre avaliações e sessões dos seus pacientes.',
    para: '/pacientes',
    acao: 'Ver meus pacientes',
  },
}

export function InicioPage() {
  const usuario = useUsuarioAtual().data
  const primeiroNome = usuario?.nome.split(' ')[0]
  // A rota protegida só mostra esta tela com o usuário carregado; o padrão nunca exibe atalho restrito.
  const perfil = usuario?.perfil ?? 'ESTUDANTE'
  const destaque = DESTAQUE[perfil]

  return (
    <div className="tf-pagina tf-inicio">
      <header className="tf-hero tf-on-deep">
        <FolhasDecorativas className="tf-hero__arte" />
        <div className="tf-hero__texto">
          {primeiroNome && <p className="tf-hero__kicker">Olá, {primeiroNome}</p>}
          <h1 className="tf-titulo">Aprenda TENS e FES</h1>
          <p className="tf-hero__sub">{destaque.sub}</p>
          <BotaoLink to={destaque.para} variante="primario">
            {destaque.acao}
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

      <section className="tf-pilha" aria-labelledby="titulo-atalhos">
        <h2 id="titulo-atalhos" className="tf-titulo tf-titulo--secao">
          Atalhos
        </h2>
        <ul className="tf-lista-cartoes">
          {ATALHOS[perfil].map((atalho) => (
            <li key={atalho.para} className="tf-cartao tf-modulo-cartao">
              <h3 className="tf-titulo tf-titulo--cartao">{atalho.titulo}</h3>
              <p className="tf-sub">{atalho.resumo}</p>
              <Link className="tf-link tf-modulo-cartao__acao" to={atalho.para}>
                {atalho.acao}
              </Link>
            </li>
          ))}
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
