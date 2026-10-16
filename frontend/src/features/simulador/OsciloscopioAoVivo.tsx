import { useEffect, useRef, useState } from 'react'
import { Botao } from '../../shared/ui/Botao'
import type { Rampas } from './calculos'
import { caminhoDoTracado, envelopeEm, escalaDeTempo, type Envelope } from './tracado'

const LARGURA = 300
const ALTURA = 80
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

type Props = {
  frequenciaHz: number
  larguraUs: number
  intensidades: [number, number]
  rampas?: Rampas
  emExecucao: boolean
}

/**
 * Segue só o painel de acessibilidade (data-movimento="reduzido" no html). O painel já parte da preferência do sistema
 * quando a pessoa não escolheu nada; consultar o sistema aqui também ignoraria quem desligou a opção no painel.
 */
function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(calcular)
  useEffect(() => {
    const observador = new MutationObserver(() => setReduzido(calcular()))
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['data-movimento'] })
    return () => observador.disconnect()
  }, [])
  return reduzido
}

const calcular = () => document.documentElement.dataset.movimento === 'reduzido'

/**
 * Osciloscópio: o traçado de cada canal corre da direita para a esquerda enquanto a simulação está em execução.
 * O caminho é reescrito direto no SVG a cada quadro (sem re-render do React). Decorativo para o leitor de tela: a
 * descrição e a tabela do simulador trazem os mesmos valores.
 */
export function OsciloscopioAoVivo({ frequenciaHz, larguraUs, intensidades, rampas, emExecucao }: Props) {
  const reduzido = useMovimentoReduzido()
  // A animação é o conteúdo do simulador, começa só pelo botão e tem pausa: com "reduzir movimento" ela fica parada,
  // mas a pessoa pode escolher animar mesmo assim.
  const [animarMesmoAssim, setAnimarMesmoAssim] = useState(false)
  const animar = emExecucao && (!reduzido || animarMesmoAssim)
  const semIntensidade = intensidades[0] === 0 && intensidades[1] === 0
  const canais = [useRef<SVGPathElement>(null), useRef<SVGPathElement>(null)]
  const cursor = useRef<SVGLineElement>(null)
  const tempoSimulado = useRef(0)
  const tempoReal = useRef(0)
  const [envelope, setEnvelope] = useState<Envelope | undefined>(() => (rampas ? envelopeEm(0, rampas) : undefined))
  const { lentidao } = escalaDeTempo(frequenciaHz)

  useEffect(() => {
    function desenhar() {
      const nivel = rampas ? envelopeEm(tempoReal.current / 1000, rampas).nivel : 1
      canais.forEach((ref, i) => {
        ref.current?.setAttribute(
          'd',
          caminhoDoTracado({
            frequenciaHz,
            larguraUs,
            intensidadeMa: intensidades[i] * nivel,
            inicioMs: tempoSimulado.current,
            largura: LARGURA,
            altura: ALTURA,
          }),
        )
      })
      if (rampas && cursor.current) {
        const x = String(10 + 280 * envelopeEm(tempoReal.current / 1000, rampas).posicao)
        cursor.current.setAttribute('x1', x)
        cursor.current.setAttribute('x2', x)
      }
    }

    desenhar()
    if (!animar) return

    let anterior: number | undefined
    let quadro = requestAnimationFrame(function passo(agora) {
      const dt = anterior === undefined ? 0 : Math.min(agora - anterior, 100)
      anterior = agora
      tempoReal.current += dt
      tempoSimulado.current += dt / lentidao
      desenhar()
      if (rampas) setEnvelope(envelopeEm(tempoReal.current / 1000, rampas))
      quadro = requestAnimationFrame(passo)
    })
    return () => cancelAnimationFrame(quadro)
    // canais são refs estáveis; o efeito reage só ao que muda o desenho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animar, frequenciaHz, larguraUs, intensidades[0], intensidades[1], rampas?.subida, rampas?.plato, rampas?.descida, rampas?.repouso, lentidao])

  const bloqueadoPeloMovimento = emExecucao && reduzido && !animarMesmoAssim
  const estado = bloqueadoPeloMovimento
    ? 'Animação parada porque "reduzir movimento" está ligado no painel de acessibilidade (botão no canto da tela).'
    : emExecucao
      ? lentidao > 1
        ? `Em execução, em câmera lenta: ${numero.format(lentidao)}× mais lento que o real.`
        : 'Em execução, em tempo real.'
      : 'Parado. Clique em Iniciar simulação para ver os pulsos correndo.'

  return (
    <figure className="tf-grafico__item tf-osciloscopio">
      {[0, 1].map((i) => (
        <div key={i} className="tf-osciloscopio__canal" aria-hidden="true">
          <span className="tf-grafico__rotulo-canal">
            Canal {i + 1} · {numero.format(intensidades[i])} mA
          </span>
          <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="tf-grafico__svg tf-osciloscopio__tela" preserveAspectRatio="none">
            <line x1="0" y1={ALTURA / 2} x2={LARGURA} y2={ALTURA / 2} className="tf-grafico__eixo" />
            <path ref={canais[i]} className={`tf-grafico__linha tf-osciloscopio__linha--c${i + 1}`} />
          </svg>
        </div>
      ))}

      {rampas && envelope && (
        <div className="tf-osciloscopio__canal" aria-hidden="true">
          <span className="tf-grafico__rotulo-canal">
            {envelope.fase}: {numero.format(envelope.decorridoS)} s de {numero.format(envelope.duracaoS)}
          </span>
          <svg viewBox="0 0 300 70" className="tf-grafico__svg">
            <line x1="0" y1="60" x2="300" y2="60" className="tf-grafico__eixo" />
            <EnvoltoriaDoCiclo rampas={rampas} />
            <line ref={cursor} x1="10" y1="4" x2="10" y2="66" className="tf-osciloscopio__cursor" />
          </svg>
        </div>
      )}

      <figcaption className="tf-grafico__legenda tf-pilha">
        <span aria-hidden="true">{estado}</span>
        {semIntensidade && <span>Intensidade em zero: aumente a intensidade de um canal para ver os pulsos.</span>}
        {bloqueadoPeloMovimento && (
          <Botao variante="secundario" onClick={() => setAnimarMesmoAssim(true)}>
            Animar mesmo assim
          </Botao>
        )}
      </figcaption>
    </figure>
  )
}

function EnvoltoriaDoCiclo({ rampas }: { rampas: Rampas }) {
  const total = rampas.subida + rampas.plato + rampas.descida + rampas.repouso
  const escala = (s: number) => (280 * s) / total
  const x1 = 10 + escala(rampas.subida)
  const x2 = x1 + escala(rampas.plato)
  const x3 = x2 + escala(rampas.descida)
  return <path d={`M10 60 L${x1} 12 H${x2} L${x3} 60 H290`} className="tf-grafico__linha tf-osciloscopio__envoltoria" />
}
