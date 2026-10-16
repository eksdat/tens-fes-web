import { Link, useSearchParams } from 'react-router'
import { Botao, BotaoLink } from '../../shared/ui/Botao'
import { OndaFes, OndaTens } from '../../shared/ui/Icones'
import { CorpoEsquematico } from './CorpoEsquematico'
import { DesenhoRegiao } from './DesenhoRegiao'
import { CREDITO_DA_ILUSTRACAO, FIGURAS, MONTAGENS, NOTAS_DO_ATLAS, type Modalidade, type Montagem } from './montagens'

type Vista = 'todas' | 'anterior' | 'posterior'

const MODALIDADES: { valor: Modalidade | 'todas'; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todos' },
  { valor: 'TENS', rotulo: 'TENS' },
  { valor: 'FES', rotulo: 'NMES/FES' },
]

const VISTAS: { valor: Vista; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'anterior', rotulo: 'Frente (anterior)' },
  { valor: 'posterior', rotulo: 'Costas (posterior)' },
]

const vistaDe = (m: Montagem): Exclude<Vista, 'todas'> => (m.ponto.figura === 'frente' ? 'anterior' : 'posterior')

type Props = {
  /** Modalidade que abre selecionada. */
  modalidade: Modalidade
  /** Rota da aba Eletrodos do módulo, usada pelos links do modo compacto. */
  base: string
  /** Só o corpo e a lista de regiões; cada região leva à aba Eletrodos. */
  compacto?: boolean
}

export function AtlasEletrodos({ modalidade, base, compacto = false }: Props) {
  const [params, setParams] = useSearchParams()

  const doParametro = params.get('modalidade')
  const modalidadeAtiva: Modalidade | 'todas' =
    !compacto && (doParametro === 'TENS' || doParametro === 'FES' || doParametro === 'todas') ? doParametro : modalidade
  const doParametroVista = params.get('vista')
  const vista: Vista = !compacto && (doParametroVista === 'anterior' || doParametroVista === 'posterior') ? doParametroVista : 'todas'

  const regioes = MONTAGENS.filter((m) => (modalidadeAtiva === 'todas' || m.modalidade === modalidadeAtiva) && (vista === 'todas' || vistaDe(m) === vista))
  const escolhida = compacto ? undefined : regioes.find((r) => r.id === params.get('regiao'))

  function atualizar(mudanca: Record<string, string>) {
    const novos = new URLSearchParams(params)
    for (const [chave, valor] of Object.entries(mudanca)) novos.set(chave, valor)
    if (novos.get('vista') === 'todas') novos.delete('vista')
    // A região escolhida só continua aberta se ainda passar pelos filtros.
    const nova = MONTAGENS.find(
      (m) =>
        m.id === novos.get('regiao') &&
        (novos.get('modalidade') === 'todas' || m.modalidade === (novos.get('modalidade') ?? modalidade)) &&
        (!novos.get('vista') || vistaDe(m) === novos.get('vista')),
    )
    if (!nova) novos.delete('regiao')
    setParams(novos, { preventScrollReset: true })
  }

  return (
    <div className="tf-atlas">
      {!compacto && (
        <div className="tf-filtros">
          <fieldset className="tf-regioes">
            <legend className="tf-filtros__rotulo">Modalidade</legend>
            {MODALIDADES.map((m) => (
              <Botao
                key={m.valor}
                variante="secundario"
                aria-pressed={modalidadeAtiva === m.valor}
                onClick={() => atualizar({ modalidade: m.valor })}
              >
                {m.rotulo}
              </Botao>
            ))}
          </fieldset>
          <fieldset className="tf-regioes">
            <legend className="tf-filtros__rotulo">Vista do corpo</legend>
            {VISTAS.map((v) => (
              <Botao key={v.valor} variante="secundario" aria-pressed={vista === v.valor} onClick={() => atualizar({ vista: v.valor })}>
                {v.rotulo}
              </Botao>
            ))}
          </fieldset>
        </div>
      )}

      <div className="tf-corpos">
        {(['frente', 'costas'] as const).map((figura) => (
          <div key={figura} className="tf-corpo">
            <p className="tf-corpo__rotulo">{figura === 'frente' ? 'Frente' : 'Costas'}</p>
            <div className="tf-corpo__moldura">
              <CorpoEsquematico figura={figura} />
              {regioes
                .filter((r) => r.ponto.figura === figura)
                .map((r) => {
                  const f = FIGURAS[figura]
                  const posicao = { left: `${((r.ponto.x - f.x) / f.w) * 100}%`, top: `${((r.ponto.y - f.y) / f.h) * 100}%` }
                  const marcado = escolhida?.id === r.id
                  // A lista de regiões é o controle acessível; o ponto no corpo é conveniência para o mouse e o toque.
                  return compacto ? (
                    <Link
                      key={r.id}
                      className="tf-ponto"
                      style={posicao}
                      to={`${base}?regiao=${r.id}`}
                      data-regiao={r.id}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  ) : (
                    <button
                      key={r.id}
                      type="button"
                      className={`tf-ponto${marcado ? ' tf-ponto--marcado' : ''}`}
                      style={posicao}
                      data-regiao={r.id}
                      aria-hidden="true"
                      tabIndex={-1}
                      onClick={() => atualizar({ regiao: r.id })}
                    />
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="tf-pilha">
        <fieldset className="tf-regioes">
          <legend className="tf-sr-only">Regiões</legend>
          {regioes.map((r) =>
            compacto ? (
              <BotaoLink key={r.id} to={`${base}?regiao=${r.id}`} variante="secundario">
                {r.nome}
              </BotaoLink>
            ) : (
              <Botao key={r.id} variante="secundario" aria-pressed={escolhida?.id === r.id} onClick={() => atualizar({ regiao: r.id })}>
                {r.nome}
              </Botao>
            ),
          )}
        </fieldset>
        {compacto ? (
          <p className="tf-sub">Escolha uma região para ver onde colocar os eletrodos.</p>
        ) : (
          <p className="tf-sub">{NOTAS_DO_ATLAS.comoLer}</p>
        )}
        {!compacto && regioes.length === 0 && <p className="tf-sub">Nenhuma região nesta combinação de modalidade e vista.</p>}
        {!compacto && regioes.length > 0 && !escolhida && (
          <p className="tf-sub">Escolha uma região no corpo ou na lista para ver a montagem.</p>
        )}
      </div>

      {escolhida && <DetalheDaRegiao montagem={escolhida} />}
    </div>
  )
}

function DetalheDaRegiao({ montagem }: { montagem: Montagem }) {
  const canais = [1, 2].filter((c) => montagem.eletrodos.some((e) => e.canal === c))
  return (
    <section className="tf-cartao tf-regiao" aria-live="polite">
      <header className="tf-regiao__topo">
        <h3 className="tf-cartao__titulo">{montagem.nome}</h3>
        <span className={`tf-etiqueta tf-etiqueta--${montagem.modalidade.toLowerCase()}`}>
          {montagem.modalidade === 'TENS' ? <OndaTens /> : <OndaFes />}
          {montagem.modalidade}
        </span>
      </header>
      <p className="tf-sub">Vista: {montagem.vista}</p>

      <div className="tf-regiao__visuais">
        <div className="tf-onde">
          <p className="tf-corpo__rotulo">Onde fica</p>
          <CorpoEsquematico figura={montagem.ponto.figura} destaque={montagem.ponto} />
          <p className="tf-corpo__rotulo">{montagem.ponto.figura === 'frente' ? 'Frente' : 'Costas'}</p>
        </div>
        <figure className="tf-regiao__figura">
          <DesenhoRegiao montagem={montagem} />
          <figcaption className="tf-sub">{montagem.descricao}</figcaption>
        </figure>
      </div>

      <ul className="tf-legenda" aria-label="Legenda do desenho">
        {canais.map((canal) => (
          <li key={canal}>
            <span className={`tf-legenda__amostra tf-eletrodo--c${canal}`} aria-hidden="true" />
            Canal {canal}: eletrodos {montagem.eletrodos.filter((e) => e.canal === canal).map((e) => e.codigo).join(' e ')}
          </li>
        ))}
        {montagem.legendaDesenho.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <section className="tf-pilha">
        <h4 className="tf-subtitulo">Legenda dos códigos</h4>
        <ul className="tf-lista-simples">
          {NOTAS_DO_ATLAS.legenda.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
      </section>

      <dl className="tf-dados">
        <dt>Objetivo</dt>
        <dd>{montagem.objetivo}</dd>
        <dt>Marcos</dt>
        <dd>{montagem.marcos}</dd>
        <dt>Resposta desejada</dt>
        <dd>{montagem.resposta}</dd>
      </dl>

      <section className="tf-pilha">
        <h4 className="tf-subtitulo">Montagem</h4>
        <ul className="tf-lista-simples">
          {montagem.montagem.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ul>
        <ul className="tf-lista-simples tf-lista-eletrodos" aria-label="Eletrodos">
          {montagem.eletrodos.map((e) => (
            <li key={e.codigo}>
              <strong>{e.codigo}</strong> · canal {e.canal} · {e.posicao}
            </li>
          ))}
        </ul>
      </section>

      <section className="tf-pilha">
        <h4 className="tf-subtitulo">Cuidados</h4>
        <ul className="tf-lista-simples">
          {montagem.cuidados.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <p className="tf-sub">{montagem.fonte}</p>
      <p className="tf-sub">{CREDITO_DA_ILUSTRACAO}</p>
    </section>
  )
}
