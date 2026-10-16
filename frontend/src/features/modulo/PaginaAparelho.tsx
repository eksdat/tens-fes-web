import { PerguntasFrequentes } from '../../shared/ui/PerguntasFrequentes'
import type { ConteudoAparelho } from '../aparelho/conteudoAparelho'
import { PainelDoAparelho } from '../aparelho/PainelDoAparelho'
import { PaginaTecnica } from './PaginaTecnica'

export function PaginaAparelho({ dados }: { dados: ConteudoAparelho }) {
  return (
    <PaginaTecnica titulo="Aparelho" fontes={dados.fontes}>
      <p className="tf-sub">{dados.introducao}</p>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Controles do aparelho</h3>
        <PainelDoAparelho controles={dados.controles} />
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Canais, cabos e conexões</h3>
        <ul className="tf-lista-simples">
          {dados.conexoes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Como operar</h3>
        <ol className="tf-passos">
          {dados.operacao.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ol>
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Perguntas frequentes</h3>
        <PerguntasFrequentes itens={dados.perguntas} fonteHref="#fonte-revisao" />
      </section>
    </PaginaTecnica>
  )
}
