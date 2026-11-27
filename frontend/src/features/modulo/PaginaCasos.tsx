import { useId, useState } from 'react'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import type { Caso, ConteudoCasos } from '../casos/conteudoCasos'
import { interpretarRelato } from '../casos/interpretarRelato'
import { PaginaTecnica } from './PaginaTecnica'
import { FeedbackCasoIa } from '../casos/FeedbackCasoIa'
import { useUsuarioAtual } from '../usuario/useUsuarioAtual'
import { CampoTextoLongo } from '../../shared/ui/CampoTextoLongo'

export function PaginaCasos({ dados, simulador }: { dados: ConteudoCasos; simulador: string }) {
  const profissional = useUsuarioAtual().data?.perfil === 'PROFISSIONAL'
  const modalidade = new URLSearchParams(simulador.split('?')[1]).get('modalidade') ?? 'TENS'
  const [relato, setRelato] = useState('')
  const [resultado, setResultado] = useState<ReturnType<typeof interpretarRelato>>()
  const [confirmado, setConfirmado] = useState(false)
  const fichas = dados.fichas ?? []

  function atualizarRelato(texto: string) {
    setRelato(texto)
    setResultado(undefined)
    setConfirmado(false)
  }

  return (
    <PaginaTecnica titulo="Casos" fontes={dados.fontes}>
      <p className="tf-sub">{dados.introducao}</p>
      <div className="tf-linha">
        <BotaoLink to={simulador}>Testar no simulador</BotaoLink>
      </div>
      {(fichas.length > 0 || profissional) && <section className="tf-cartao tf-pilha" aria-labelledby="interpretar-relato">
        <h2 id="interpretar-relato" className="tf-subtitulo">Relato fictício</h2>
        {fichas.length > 0 && <p className="tf-sub">
          A busca compara o relato com as fichas de referência deste módulo. Carregue o exemplo e clique em <strong>Buscar ficha de referência</strong> para ver os critérios reconhecidos e os dados que ainda faltam.
        </p>}
        <CampoTextoLongo id="relato-caso" rotulo="Relato" value={relato} maxLength={2000} rows={4}
          dica="Descreva a condição fictícia, a tarefa e o que acontece durante o movimento."
          onChange={(evento) => atualizarRelato(evento.target.value)} />
        {fichas.length > 0 && <div className="tf-linha">
          {fichas.map((ficha) => <Botao key={ficha.id} variante="secundario" onClick={() => atualizarRelato(ficha.exemploRelato)}>
            Carregar exemplo de {ficha.modalidade}
          </Botao>)}
          <Botao disabled={!relato.trim()} onClick={() => setResultado(interpretarRelato(relato, fichas))}>
            Buscar ficha de referência
          </Botao>
        </div>}
        {resultado && <output className="tf-caso__resposta" aria-live="polite">
          <p className="tf-sub">{resultado.confirmacao}</p>
          {!resultado.ficha && <p className="tf-sub">
            Esta busca cobre apenas as fichas do módulo. Experimente o exemplo acima ou abra <strong>Testar no simulador</strong> e use <strong>Simular com IA</strong> para explorar outro relato fictício.
          </p>}
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
        {profissional && <FeedbackCasoIa key={`${modalidade}:${relato}`} rota="/simulacoes/ia/feedback"
          rascunho={{ modalidade, relato }} />}
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
