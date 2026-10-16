import { Alerta } from '../../shared/ui/Alerta'
import { PaginaTecnica } from './PaginaTecnica'
import type { Modulo } from './tipos'

export function PaginaParametros({ dados }: { dados: Modulo['parametros'] }) {
  return (
    <PaginaTecnica titulo="Parâmetros" fontes={dados.fontes}>
      <Alerta intencao="atencao" titulo="Faixa educativa, não é prescrição">
        {dados.aviso}
      </Alerta>

      <section className="tf-pilha">
        <h3 className="tf-subtitulo">{dados.titulo}</h3>
        <ul className="tf-lista-cartoes">
          {dados.modos?.map((modo) => (
            <li key={modo.nome} className="tf-cartao tf-modo">
              <h4 className="tf-cartao__titulo">{modo.nome}</h4>
              <dl className="tf-dados">
                {modo.faixa ? (
                  <>
                    <dt className="tf-etiqueta">Faixa educativa</dt>
                    <dd className="tf-modo__faixa">{modo.faixa}</dd>
                  </>
                ) : null}
                <dt>Objetivo e resposta</dt>
                <dd>{modo.resposta}</dd>
              </dl>
            </li>
          ))}
          {dados.campos?.map((campo) => (
            <li key={campo.nome} className="tf-cartao tf-modo">
              <h4 className="tf-cartao__titulo">{campo.nome}</h4>
              <dl className="tf-dados">
                {campo.faixa ? (
                  <>
                    <dt className="tf-etiqueta">Faixa educativa</dt>
                    <dd className="tf-modo__faixa">{campo.faixa}</dd>
                  </>
                ) : null}
                <dt>Como interpretar</dt>
                <dd>{campo.texto}</dd>
              </dl>
            </li>
          ))}
        </ul>
        {dados.notaModos && <p className="tf-sub">{dados.notaModos}</p>}
      </section>

      {dados.exemplos.map((exemplo, i) => (
        <section key={exemplo.titulo} className="tf-pilha tf-cartao" aria-labelledby={`exemplo-${i}`}>
          <h3 id={`exemplo-${i}`} className="tf-cartao__titulo">
            {exemplo.titulo}
          </h3>
          <dl className="tf-dados">
            <dt>Contexto</dt>
            <dd>{exemplo.contexto}</dd>
            <dt>Ajustes</dt>
            <dd>
              <ul className="tf-lista-simples">
                {exemplo.ajustes.map((ajuste) => (
                  <li key={ajuste}>{ajuste}</li>
                ))}
              </ul>
            </dd>
            {exemplo.calculo && (
              <>
                <dt>Contas</dt>
                <dd>
                  <ul className="tf-lista-simples">
                    {exemplo.calculo.map((linha) => (
                      <li key={linha}>{linha}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
            {exemplo.classificacao && (
              <>
                <dt>Classificação</dt>
                <dd>{exemplo.classificacao}</dd>
              </>
            )}
            {exemplo.tarefa && (
              <>
                <dt>Tarefa</dt>
                <dd>{exemplo.tarefa}</dd>
              </>
            )}
            {exemplo.justificativa && (
              <>
                <dt>Justificativa</dt>
                <dd>{exemplo.justificativa}</dd>
              </>
            )}
            <dt>Fonte</dt>
            <dd>{exemplo.fonte}</dd>
            <dt>Limitações</dt>
            <dd>{exemplo.limitacoes}</dd>
          </dl>
        </section>
      ))}

      {dados.camposObrigatorios && (
        <section className="tf-pilha">
          <h3 className="tf-subtitulo">Campos que não podem ser omitidos</h3>
          <ul className="tf-lista-simples">
            {dados.camposObrigatorios.map((campo) => (
              <li key={campo}>{campo}</li>
            ))}
          </ul>
          {dados.foraDoEscopo && <p className="tf-sub">{dados.foraDoEscopo}</p>}
        </section>
      )}

      <section className="tf-pilha tf-cartao" aria-labelledby="especificacao-fabricante">
        <h3 id="especificacao-fabricante" className="tf-cartao__titulo">
          Especificação do fabricante
        </h3>
        <p className="tf-sub">Faixas do manual do aparelho de referência. Não são faixa educativa e podem diferir dela.</p>
        <ul className="tf-lista-simples">
          {dados.doFabricante.linhas.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
        <p className="tf-sub">{dados.doFabricante.fonte}</p>
      </section>
    </PaginaTecnica>
  )
}
