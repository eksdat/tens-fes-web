import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Alerta } from '../../shared/ui/Alerta'
import { Botao } from '../../shared/ui/Botao'
import { Campo } from '../../shared/ui/Campo'
import { CampoSelecao } from '../../shared/ui/CampoSelecao'
import { IconeAtencao } from '../../shared/ui/Icones'
import { useEstadoDoAparelho } from '../aparelho/useEstadoDoAparelho'
import { mensagemDeAjuste } from '../aparelho/valores'
import type { FaixaApi, Modalidade } from './api'
import {
  cargaFaseMicroC,
  ciclo,
  cicloTrabalho,
  descreverPulso,
  limitarAoAparelho,
  mensagensDeSituacao,
  periodoMs,
  tempoOn,
  type FaixasDoCampo,
  type Mensagem,
  type Rampas,
} from './calculos'
import { GraficoPulso } from './GraficoPulso'
import { BURST, valorInicialDoModo, type Forma } from './tracado'
import { useFaixas } from './useFaixas'

type CampoId = 'frequencia' | 'largura' | 'intensidade1' | 'intensidade2' | 'subida' | 'plato' | 'descida' | 'repouso'
type Textos = Record<CampoId, string>

const CAMPOS: { id: CampoId; rotulo: string; parametro: string; soFes?: boolean }[] = [
  { id: 'frequencia', rotulo: 'Frequência', parametro: 'Frequência' },
  { id: 'largura', rotulo: 'Largura de pulso', parametro: 'Largura de pulso' },
  { id: 'intensidade1', rotulo: 'Intensidade do canal 1', parametro: 'Intensidade' },
  { id: 'intensidade2', rotulo: 'Intensidade do canal 2', parametro: 'Intensidade' },
  { id: 'subida', rotulo: 'Rampa de subida', parametro: 'Rampa de subida', soFes: true },
  { id: 'plato', rotulo: 'Platô', parametro: 'Platô', soFes: true },
  { id: 'descida', rotulo: 'Rampa de descida', parametro: 'Rampa de descida', soFes: true },
  { id: 'repouso', rotulo: 'Repouso', parametro: 'Repouso (tempo OFF)', soFes: true },
]

/** Valores de partida: exemplo do TENS (guia, seção 07) e Exercício A do FES (seção 08). Intensidade sempre em zero. */
const INICIAL: Record<Modalidade, Textos> = {
  TENS: { frequencia: '80', largura: '100', intensidade1: '0', intensidade2: '0', subida: '', plato: '', descida: '', repouso: '' },
  FES: { frequencia: '35', largura: '300', intensidade1: '0', intensidade2: '0', subida: '2', plato: '6', descida: '2', repouso: '30' },
}

const MODO_PADRAO: Record<Modalidade, string> = { TENS: 'Convencional', FES: 'FES síncrono' }

/** Nome na tela, de qual modo vêm as faixas e como os pulsos se distribuem no tempo. */
type ModoDoSimulador = { nome: string; faixasDe: string; forma: Forma }

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

function ler(texto: string): number | null {
  if (texto.trim() === '') return null
  const valor = Number(texto.replace(',', '.'))
  return Number.isNaN(valor) ? null : valor
}

/**
 * TENS: os modos com frequência e largura do manual (pulso contínuo) e o Burst, que tem frequência fixa e só a largura
 * ajustável. FES: as mesmas faixas em dois modos do manual (cap. 8.2.5), síncrono e recíproco.
 */
function modosDoSimulador(modalidade: Modalidade, faixas: FaixaApi[]): ModoDoSimulador[] {
  const temAparelho = (modo: string, parametro: string) =>
    faixas.some((f) => f.modo === modo && f.parametro === parametro && f.origem === 'APARELHO')
  if (modalidade === 'FES') {
    if (!temAparelho('FES', 'Frequência')) return []
    return [
      { nome: 'FES síncrono', faixasDe: 'FES', forma: 'sincrono' },
      { nome: 'FES recíproco', faixasDe: 'FES', forma: 'reciproco' },
    ]
  }
  const continuos: ModoDoSimulador[] = [...new Set(faixas.map((f) => f.modo))]
    .filter((m) => temAparelho(m, 'Frequência') && temAparelho(m, 'Largura de pulso'))
    .map((m) => ({ nome: m, faixasDe: m, forma: 'continuo' }))
  const burst: ModoDoSimulador[] = temAparelho('Burst', 'Largura de pulso') ? [{ nome: 'Burst', faixasDe: 'Burst', forma: 'burst' }] : []
  return [...continuos, ...burst]
}

/** Links antigos usavam modo=FES. */
const lerModoPedido = (valor: string | null) => (valor === 'FES' ? 'FES síncrono' : (valor ?? ''))

function faixasDo(faixas: FaixaApi[], modo: string, parametro: string): FaixasDoCampo & { unidade: string; extenso: string } {
  const doCampo = faixas.filter((f) => f.modo === modo && f.parametro === parametro)
  const de = (origem: FaixaApi['origem']) => {
    const f = doCampo.find((x) => x.origem === origem)
    return f ? { minimo: f.minimo, maximo: f.maximo } : undefined
  }
  return { educativa: de('EDUCATIVA'), aparelho: de('APARELHO'), unidade: doCampo[0]?.unidade ?? '', extenso: doCampo[0]?.unidadeExtenso ?? '' }
}

export function SimuladorPage() {
  const [params, setParams] = useSearchParams()
  const modalidade: Modalidade = params.get('modalidade') === 'FES' ? 'FES' : 'TENS'
  const [textos, setTextos] = useState<Textos>(() => INICIAL[modalidade])
  const [ajustes, setAjustes] = useState<Partial<Record<CampoId, Mensagem[]>>>({})
  const [anuncio, setAnuncio] = useState('')
  const confirmados = useRef<Textos>(textos)
  const { estado, atualizar } = useEstadoDoAparelho()
  const consulta = useFaixas(modalidade)

  const faixas = consulta.data ?? []
  const opcoes = modosDoSimulador(modalidade, faixas)
  const nomes = opcoes.map((m) => m.nome)
  const pedido = lerModoPedido(params.get('modo'))
  const modo = nomes.includes(pedido) ? pedido : nomes.includes(MODO_PADRAO[modalidade]) ? MODO_PADRAO[modalidade] : (nomes[0] ?? '')
  const atual = opcoes.find((m) => m.nome === modo)
  const forma: Forma = atual?.forma ?? 'continuo'
  const faixasDoModo = atual?.faixasDe ?? modo
  const modoIndisponivel = !consulta.isPending && pedido !== '' && !nomes.includes(pedido) && nomes.length > 0

  /** Frequência e largura no meio da faixa do modo (guia, seções 07 e 08), sempre dentro do que o aparelho aceita. */
  function valoresDoModo(m: ModoDoSimulador) {
    const freq = m.forma === 'burst' ? undefined : valorInicialDoModo(faixasDo(faixas, m.faixasDe, 'Frequência'))
    const larg = valorInicialDoModo(faixasDo(faixas, m.faixasDe, 'Largura de pulso'))
    return { frequencia: freq === undefined ? undefined : String(freq), largura: larg === undefined ? undefined : String(larg) }
  }

  // Ao abrir por link num modo que não é o padrão, os valores de partida (do modo padrão) ficariam fora da faixa.
  const abriuNoModo = useRef(false)
  useEffect(() => {
    if (abriuNoModo.current || !atual) return
    abriuNoModo.current = true
    if (atual.nome === MODO_PADRAO[modalidade]) return
    const v = valoresDoModo(atual)
    setTextos((atuais) => {
      const novos = { ...atuais, frequencia: v.frequencia ?? atuais.frequencia, largura: v.largura ?? atuais.largura }
      confirmados.current = novos
      return novos
    })
    // valoresDoModo depende de faixas, que chegam junto com atual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atual])

  function escolherModalidade(nova: Modalidade) {
    if (nova === modalidade) return
    setParams({ modalidade: nova, modo: MODO_PADRAO[nova] }, { replace: true })
    setTextos(INICIAL[nova])
    confirmados.current = INICIAL[nova]
    setAjustes({})
    setAnuncio('')
  }

  // Trocar de modo exige reiniciar a amplitude (guia, seção 13) e leva frequência e largura para a faixa do novo modo.
  function escolherModo(novo: string) {
    const m = opcoes.find((o) => o.nome === novo)
    if (!m) return
    setParams({ modalidade, modo: novo }, { replace: true })
    const zerados = (['intensidade1', 'intensidade2'] as const).filter((id) => (ler(textos[id]) ?? 0) !== 0)
    const v = valoresDoModo(m)
    const frases = zerados.map((id) => mensagemDeAjuste(id, 0, ''))
    if (v.frequencia !== undefined && ler(v.frequencia) !== ler(textos.frequencia)) {
      frases.push(mensagemDeAjuste('frequencia', Number(v.frequencia), faixasDo(faixas, m.faixasDe, 'Frequência').extenso))
    }
    if (v.largura !== undefined && ler(v.largura) !== ler(textos.largura)) {
      frases.push(mensagemDeAjuste('largura', Number(v.largura), faixasDo(faixas, m.faixasDe, 'Largura de pulso').extenso))
    }
    const novos = {
      ...textos,
      intensidade1: '0',
      intensidade2: '0',
      frequencia: v.frequencia ?? textos.frequencia,
      largura: v.largura ?? textos.largura,
    }
    setTextos(novos)
    confirmados.current = novos
    setAjustes({})
    setAnuncio(frases.join(' '))
  }

  function alternarSimulacao() {
    const proximo = !estado.emExecucao
    atualizar({ emExecucao: proximo })
    setAnuncio(proximo ? 'Simulação iniciada.' : 'Simulação pausada.')
  }

  function mudar(id: CampoId, texto: string) {
    setTextos((atuais) => ({ ...atuais, [id]: texto }))
    setAjustes((atuais) => ({ ...atuais, [id]: undefined }))
  }

  /** Só anuncia o valor confirmado ao sair do campo, e só se mudou: anunciar a cada tecla seria ruído para o leitor de tela. */
  function anunciarAjuste(id: CampoId, valor: number, extenso: string) {
    const final = String(valor).replace('.', ',')
    if (ler(confirmados.current[id]) === valor) return
    confirmados.current = { ...confirmados.current, [id]: final }
    setAnuncio(mensagemDeAjuste(id, valor, extenso))
  }

  function travarNoAparelho(id: CampoId, parametro: string) {
    const valor = ler(textos[id])
    const faixa = faixasDo(faixas, faixasDoModo, parametro)
    if (valor === null || !faixa.aparelho) return
    const limite = limitarAoAparelho(valor, faixa.aparelho)
    anunciarAjuste(id, limite, faixa.extenso)
    if (limite === valor) return
    setTextos((atuais) => ({ ...atuais, [id]: String(limite).replace('.', ',') }))
    setAjustes((atuais) => ({
      ...atuais,
      [id]: [
        ...mensagensDeSituacao({ campo: id, valor, faixas: faixa }).filter((m) => m.tipo !== 'fora-aparelho'),
        {
          tipo: 'fora-aparelho',
          texto: `O valor está fora da faixa documentada para o aparelho selecionado. Valor ajustado para ${numero.format(limite)} ${faixa.unidade}, o limite do aparelho.`,
        },
      ],
    }))
  }

  const campos = CAMPOS.filter((c) => (!c.soFes || modalidade === 'FES') && !(c.id === 'frequencia' && forma === 'burst'))
  const valores = Object.fromEntries(CAMPOS.map((c) => [c.id, ler(textos[c.id])])) as Record<CampoId, number | null>
  if (forma === 'burst') valores.frequencia = BURST.frequenciaInternaHz
  const rampas: Rampas | undefined =
    modalidade === 'FES' && [valores.subida, valores.plato, valores.descida, valores.repouso].every((v) => v !== null)
      ? { subida: valores.subida!, plato: valores.plato!, descida: valores.descida!, repouso: valores.repouso! }
      : undefined
  const intensidades: [number, number] = [valores.intensidade1 ?? 0, valores.intensidade2 ?? 0]
  const pulsoValido = (valores.frequencia ?? 0) > 0 && (valores.largura ?? 0) > 0 && (modalidade === 'TENS' || !!rampas)
  const fontes = [...new Set(faixas.filter((f) => f.modo === faixasDoModo).map((f) => f.fonte))]

  const frequenciaHz = valores.frequencia ?? 0
  const larguraUs = valores.largura ?? 0
  useEffect(() => {
    atualizar({ modalidade, modo, frequenciaHz, larguraUs, intensidade1: intensidades[0], intensidade2: intensidades[1] })
    // intensidades é um par novo a cada render; as duas posições estão na lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atualizar, modalidade, modo, frequenciaHz, larguraUs, intensidades[0], intensidades[1]])

  return (
    <div className="tf-pagina tf-pilha tf-simulador">
      <header className="tf-pilha">
        <p className="tf-modulo__kicker">Modo explorar</p>
        <h1 className="tf-titulo">Simulador</h1>
        <p className="tf-sub">Mude um parâmetro por vez e veja o pulso mudar. A intensidade começa em zero.</p>
      </header>


      <output className="tf-sr-only" aria-label="Avisos do simulador">
        {anuncio}
      </output>

      {modoIndisponivel && (
        <Alerta titulo="Recurso não disponível neste modelo.">
          O modo {pedido} não é simulado. O simulador abriu o modo {modo}.
        </Alerta>
      )}

      {consulta.isPending ? (
        <p className="tf-sub">Carregando as faixas do aparelho…</p>
      ) : consulta.isError ? (
        <Alerta intencao="perigo" titulo="Não foi possível carregar as faixas">
          Sem as faixas do aparelho o simulador não confere os valores. Tente de novo em instantes.
        </Alerta>
      ) : nomes.length === 0 ? (
        <Alerta titulo="Selecione o aparelho para consultar os limites.">
          Sem as faixas de um aparelho o simulador não confere os valores.
        </Alerta>
      ) : (
        <div className="tf-simulador__corpo">
          <section className="tf-pilha tf-cartao" aria-labelledby="titulo-ajustes">
            <h2 id="titulo-ajustes" className="tf-subtitulo">
              Ajustes
            </h2>
            <fieldset className="tf-grupo-botoes">
              <legend className="tf-sr-only">Modalidade</legend>
              {(['TENS', 'FES'] as const).map((m) => (
                <Botao key={m} variante="secundario" aria-pressed={modalidade === m} onClick={() => escolherModalidade(m)}>
                  {m}
                </Botao>
              ))}
            </fieldset>
            <Botao variante="secundario" aria-pressed={estado.emExecucao} onClick={alternarSimulacao}>
              {estado.emExecucao ? 'Pausar simulação' : 'Iniciar simulação'}
            </Botao>
            <CampoSelecao
              rotulo="Modo"
              opcoes={nomes.map((m) => ({ valor: m, rotulo: m }))}
              value={modo}
              onChange={(e) => escolherModo(e.target.value)}
            />
            {forma === 'burst' && (
              <p className="tf-sub">
                Rajadas de 250 Hz, 2 por segundo, fixas neste aparelho (manual, cap. 8.2.4). Só a largura de pulso é
                ajustável. O manual não diz quantos pulsos há em cada rajada: o desenho usa 7, como esquema.
              </p>
            )}
            <div className="tf-simulador__campos">
              {campos.map((c) => {
                const faixa = faixasDo(faixas, faixasDoModo, c.parametro)
                const mensagens =
                  ajustes[c.id] ?? mensagensDeSituacao({ campo: c.id, valor: valores[c.id], faixas: faixa })
                return (
                  <CampoParametro
                    key={c.id}
                    id={`campo-${c.id}`}
                    rotulo={c.rotulo}
                    faixa={faixa}
                    intensidade={c.parametro === 'Intensidade'}
                    texto={textos[c.id]}
                    mensagens={mensagens}
                    aoMudar={(texto) => mudar(c.id, texto)}
                    aoSair={() => travarNoAparelho(c.id, c.parametro)}
                  />
                )
              })}
            </div>
          </section>

          <section className="tf-pilha tf-cartao" aria-labelledby="titulo-pulso">
            <h2 id="titulo-pulso" className="tf-subtitulo">
              Pulso
            </h2>
            {pulsoValido && (
              <GraficoPulso
                frequenciaHz={valores.frequencia!}
                larguraUs={valores.largura!}
                rampas={rampas}
                intensidades={intensidades}
                emExecucao={estado.emExecucao}
                forma={forma}
              />
            )}
            <p className="tf-sub" data-testid="descricao-pulso" aria-live="polite">
              {pulsoValido
                ? descreverPulso({ modalidade, modo, frequenciaHz: valores.frequencia!, larguraUs: valores.largura!, intensidadeMa: intensidades, rampas, forma })
                : 'Ainda faltam dados para descrever o pulso.'}
            </p>
            {pulsoValido && (
              <TabelaDoPulso frequenciaHz={valores.frequencia!} larguraUs={valores.largura!} intensidades={intensidades} rampas={rampas} />
            )}
          </section>
        </div>
      )}

      {fontes.length > 0 && (
        <footer className="tf-tecnica__rodape">
          <h2 className="tf-tecnica__titulo">Fonte das faixas</h2>
          <ul className="tf-lista-simples">
            {fontes.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </footer>
      )}
    </div>
  )
}

type CampoParametroProps = {
  id: string
  rotulo: string
  faixa: ReturnType<typeof faixasDo>
  intensidade: boolean
  texto: string
  mensagens: Mensagem[]
  aoMudar: (texto: string) => void
  aoSair: () => void
}

/** Valor com a unidade fixa ao lado (CampoParametro do design system). A unidade por extenso vai na dica. */
function CampoParametro({ id, rotulo, faixa, intensidade, texto, mensagens, aoMudar, aoSair }: CampoParametroProps) {
  const intervalo = (f?: { minimo: number; maximo: number }) => f && `${numero.format(f.minimo)} a ${numero.format(f.maximo)} ${faixa.unidade}`
  const dica = [
    `Em ${faixa.extenso} (${faixa.unidade}).`,
    faixa.aparelho && `Aparelho: ${intervalo(faixa.aparelho)}.`,
    faixa.educativa && `Faixa educativa: ${intervalo(faixa.educativa)}.`,
    intensidade && 'Começa em zero e nunca traz valor sugerido.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="tf-pilha tf-simulador__campo">
      <Campo
        id={id}
        rotulo={rotulo}
        dica={dica}
        inputMode="decimal"
        autoComplete="off"
        value={texto}
        onChange={(e) => aoMudar(e.target.value)}
        onBlur={aoSair}
        aria-describedby={`${id}-dica ${id}-mensagens`}
        complemento={
          <span className="tf-control__unidade" aria-hidden="true">
            {faixa.unidade}
          </span>
        }
      />
      <ul id={`${id}-mensagens`} className="tf-simulador__mensagens" aria-live="polite">
        {mensagens.map((m) => (
          <li key={m.texto} className={`tf-simulador__mensagem tf-simulador__mensagem--${m.tipo}`}>
            <IconeAtencao />
            <span>{m.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type TabelaProps = { frequenciaHz: number; larguraUs: number; intensidades: [number, number]; rampas?: Rampas }

function TabelaDoPulso({ frequenciaHz, larguraUs, intensidades, rampas }: TabelaProps) {
  const linhas: [string, string][] = [
    ['Duração de cada fase', `${numero.format(larguraUs)} µs`],
    ['Duração do pulso', `${numero.format(2 * larguraUs)} µs`],
    ['Frequência', `${numero.format(frequenciaHz)} Hz`],
    ['Período', `${numero.format(periodoMs(frequenciaHz))} ms`],
    ['Intensidade do canal 1', `${numero.format(intensidades[0])} mA`],
    ['Intensidade do canal 2', `${numero.format(intensidades[1])} mA`],
    ['Carga por fase no canal 1', `${numero.format(cargaFaseMicroC(intensidades[0], larguraUs))} µC`],
    ['Carga por fase no canal 2', `${numero.format(cargaFaseMicroC(intensidades[1], larguraUs))} µC`],
  ]
  if (rampas) {
    const on = tempoOn(rampas)
    linhas.push(
      ['Estímulo (ON)', `${numero.format(on)} s`],
      ['Ciclo', `${numero.format(ciclo(on, rampas.repouso))} s`],
      ['Ciclo de trabalho', `${numero.format(cicloTrabalho(on, rampas.repouso))}%`],
    )
  }
  return (
    <table className="tf-tabela">
      <caption className="tf-sr-only">Valores do gráfico</caption>
      <tbody>
        {linhas.map(([nome, valor]) => (
          <tr key={nome}>
            <th scope="row">{nome}</th>
            <td>{valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
