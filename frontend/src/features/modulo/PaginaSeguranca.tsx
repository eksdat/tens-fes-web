import { Alerta } from '../../shared/ui/Alerta'
import { ChecklistSeguranca } from '../seguranca/ChecklistSeguranca'
import type { ConteudoSeguranca } from '../seguranca/conteudoSeguranca'
import { PaginaTecnica } from './PaginaTecnica'

export function PaginaSeguranca({ dados }: { dados: ConteudoSeguranca }) {
  return (
    <PaginaTecnica titulo="Segurança" fontes={dados.fontes}>
      <p className="tf-sub">{dados.introducao}</p>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Antes da aplicação</h3>
        <ul className="tf-lista-cartoes">
          {dados.antes.map((item) => (
            <li key={item.situacao} className="tf-cartao tf-modo">
              <h4 className="tf-cartao__titulo">{item.situacao}</h4>
              <p className="tf-sub">{item.conduta}</p>
            </li>
          ))}
        </ul>
      </section>

      <ChecklistSeguranca etapas={dados.checklist} />

      <section className="tf-pilha" aria-labelledby="gatilhos-seguranca">
        <h3 id="gatilhos-seguranca" className="tf-subtitulo">
          Quando interromper ou revisar
        </h3>
        {dados.gatilhos.map((g) => (
          <Alerta key={g.gatilho} intencao={g.urgente ? 'perigo' : 'atencao'} titulo={g.gatilho}>
            {g.mensagem}
          </Alerta>
        ))}
      </section>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">Fora do escopo deste módulo</h3>
        <ul className="tf-lista-simples">
          {dados.foraDoEscopo.itens.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="tf-sub">{dados.foraDoEscopo.nota}</p>
      </section>
    </PaginaTecnica>
  )
}
