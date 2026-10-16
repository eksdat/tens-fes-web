import { useId, useState } from 'react'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import type { Caso, ConteudoCasos } from '../casos/conteudoCasos'
import { PaginaTecnica } from './PaginaTecnica'

export function PaginaCasos({ dados, simulador }: { dados: ConteudoCasos; simulador: string }) {
  return (
    <PaginaTecnica titulo="Casos" fontes={dados.fontes}>
      <p className="tf-sub">{dados.introducao}</p>
      <div className="tf-linha">
        <BotaoLink to={simulador}>Testar no simulador</BotaoLink>
      </div>
      <ul className="tf-casos">
        {dados.casos.map((caso) => (
          <li key={caso.titulo}>
            <CartaoCaso caso={caso} />
          </li>
        ))}
      </ul>
    </PaginaTecnica>
  )
}

function CartaoCaso({ caso }: { caso: Caso }) {
  const id = useId()
  const [aberto, setAberto] = useState(false)
  return (
    <article className="tf-cartao tf-caso" aria-labelledby={`${id}-titulo`}>
      <h3 id={`${id}-titulo`} className="tf-cartao__titulo">
        {caso.titulo}
      </h3>
      <dl className="tf-dados">
        <dt>Enunciado</dt>
        <dd>{caso.enunciado}</dd>
        {caso.pergunta && (
          <>
            <dt>Pergunta</dt>
            <dd>{caso.pergunta}</dd>
          </>
        )}
      </dl>
      <div>
        <Botao variante="secundario" aria-expanded={aberto} aria-controls={`${id}-resposta`} onClick={() => setAberto(!aberto)}>
          {aberto ? 'Ocultar a resposta' : 'Ver a resposta'}
        </Botao>
      </div>
      {aberto && (
        <section id={`${id}-resposta`} className="tf-caso__resposta" aria-label={caso.rotuloResposta}>
          <h4 className="tf-subtitulo">{caso.rotuloResposta}</h4>
          {caso.resposta.map((p) => (
            <p key={p} className="tf-sub">
              {p}
            </p>
          ))}
          {caso.perguntarSobre && (
            <>
              <p className="tf-sub">Pergunte sobre:</p>
              <ul className="tf-lista-simples">
                {caso.perguntarSobre.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {caso.depois?.map((p) => (
            <p key={p} className="tf-sub">
              {p}
            </p>
          ))}
        </section>
      )}
    </article>
  )
}
