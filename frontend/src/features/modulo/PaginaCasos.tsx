import { useId, useState } from 'react'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import type { Caso, ConteudoCasos } from '../casos/conteudoCasos'
import { interpretarRelato } from '../casos/interpretarRelato'
import { PaginaTecnica } from './PaginaTecnica'

export function PaginaCasos({ dados, simulador }: { dados: ConteudoCasos; simulador: string }) {
  const [relato, setRelato] = useState('')
  const [resultado, setResultado] = useState<ReturnType<typeof interpretarRelato>>()
  const [confirmado, setConfirmado] = useState(false)
  return (
    <PaginaTecnica titulo="Casos" fontes={dados.fontes}>
      <p className="tf-sub">{dados.introducao}</p>
      <div className="tf-linha">
        <BotaoLink to={simulador}>Testar no simulador</BotaoLink>
      </div>
      {dados.fichas && <section className="tf-cartao tf-pilha" aria-labelledby="interpretar-relato">
        <h2 id="interpretar-relato" className="tf-subtitulo">Relato fictício</h2>
        <p className="tf-sub">Escreva em português. A leitura é determinística e educativa; não substitui avaliação nem gera prescrição.</p>
        <label htmlFor="relato-caso">Relato</label>
        <textarea id="relato-caso" value={relato} onChange={(e) => { setRelato(e.target.value); setResultado(undefined); setConfirmado(false) }} rows={4} />
        <Botao variante="secundario" onClick={() => setResultado(interpretarRelato(relato, dados.fichas ?? []))}>Interpretar relato</Botao>
        {resultado && <output className="tf-caso__resposta" aria-live="polite">
          <p className="tf-sub">{resultado.confirmacao}</p>
          {resultado.ficha && <><h3 className="tf-subtitulo">{resultado.ficha.titulo} · v{resultado.ficha.versao}</h3>
            <p className="tf-sub"><strong>Contexto:</strong> {resultado.ficha.contexto}</p>
            <p className="tf-sub"><strong>Parâmetros reportados:</strong> {resultado.ficha.parametrosReportados.join('; ')}</p>
            <p className="tf-sub"><strong>Ausentes:</strong> {resultado.ficha.valoresAusentes.join('; ')}</p>
            <p className="tf-sub"><strong>Limites:</strong> {resultado.ficha.limites.join(' ')}</p>
            <p className="tf-sub"><strong>Fonte:</strong> <a href={resultado.ficha.fonte.url} target="_blank" rel="noreferrer">{resultado.ficha.fonte.referencia}</a></p>
            {resultado.faltantes.length > 0 ? <p className="tf-sub"><strong>Confirme/complemente:</strong> {resultado.faltantes.join('; ')}</p> : resultado.ficha.simulador && <>
              <label><input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} /> Confirmei os achados e os dados faltantes antes de abrir.</label>
              {confirmado && <BotaoLink to={`${simulador.split('?')[0]}?${new URLSearchParams({
                modalidade: resultado.ficha.simulador.modalidade,
                modo: resultado.ficha.simulador.modo,
                protocolo: resultado.ficha.id,
                versao: resultado.ficha.versao,
              })}`}>Abrir parâmetros representáveis</BotaoLink>}
            </>}
          </>}
        </output>}
      </section>}
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
