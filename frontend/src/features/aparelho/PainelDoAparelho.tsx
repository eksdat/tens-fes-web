import { useState } from 'react'
import type { Controle } from './conteudoAparelho'

/**
 * Painel frontal do aparelho de referência, desenhado a partir da disposição de fotos do Neurodyn Portable. Desenho
 * original, sem marca nem foto do fabricante. Só a face frontal aparece: as peças 9 a 14 (clip, etiqueta, bateria e
 * conectores) ficam em outras faces e valem só pela lista, que traz o mesmo conteúdo do desenho.
 */

const LARGURA = 220
const ALTURA = 340

/** Onde cada controle da face frontal aparece no desenho (coordenadas do viewBox). Controles com dois botões têm dois pontos. */
const POSICOES: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 168, y: 292 }],
  2: [{ x: 40, y: 238 }],
  3: [{ x: 110, y: 74 }],
  4: [
    { x: 110, y: 200 },
    { x: 110, y: 264 },
  ],
  5: [
    { x: 78, y: 232 },
    { x: 142, y: 232 },
  ],
  6: [{ x: 110, y: 232 }],
  7: [
    { x: 52, y: 170 },
    { x: 168, y: 170 },
  ],
  8: [{ x: 110, y: 150 }],
}

export function PainelDoAparelho({ controles }: { controles: Controle[] }) {
  const [ativo, setAtivo] = useState<number | null>(null)
  const escolhido = controles.find((c) => c.numero === ativo)
  const marcados = ativo ? (POSICOES[ativo] ?? []) : []

  function alternar(numero: number) {
    setAtivo((atual) => (atual === numero ? null : numero))
  }

  return (
    <div className="tf-aparelho">
      <div className="tf-painel">
        <div className="tf-painel__moldura">
          <svg className="tf-painel__svg" viewBox={`0 0 ${LARGURA} ${ALTURA}`} aria-hidden="true" focusable="false">
            <rect className="tf-painel__corpo" x="20" y="8" width="180" height="324" rx="24" />
            <rect className="tf-painel__moldura-tela" x="34" y="26" width="152" height="96" rx="8" />
            <rect className="tf-painel__tela" x="44" y="36" width="132" height="76" rx="3" />
            <text className="tf-painel__texto-tela" x="50" y="50">
              HOME
            </text>
            <text className="tf-painel__texto-tela" x="110" y="72" textAnchor="middle">
              PROTOCOLOS
            </text>
            <text className="tf-painel__texto-tela tf-painel__texto-tela--forte" x="110" y="90" textAnchor="middle">
              TERAPIA
            </text>
            <text className="tf-painel__texto-tela" x="110" y="106" textAnchor="middle">
              MENU
            </text>

            <circle className="tf-painel__led" cx="110" cy="150" r="4" />

            <Canal x={52} rotulo="Canal 1" />
            <Canal x={168} rotulo="Canal 2" />

            <rect className="tf-painel__ranhura" x="34" y="235" width="14" height="6" rx="2" />

            <path className="tf-painel__tecla" d="M110 188 L138 214 L82 214 Z" />
            <text className="tf-painel__texto-tecla" x="110" y="208" textAnchor="middle">
              SET +
            </text>
            <path className="tf-painel__tecla" d="M110 276 L138 250 L82 250 Z" />
            <text className="tf-painel__texto-tecla" x="110" y="268" textAnchor="middle">
              SET −
            </text>
            <path className="tf-painel__tecla tf-painel__tecla--escura" d="M70 214 L96 226 L96 238 L70 250 Z" />
            <text className="tf-painel__texto-tecla tf-painel__texto-tecla--clara" x="82" y="235" textAnchor="middle">
              BACK
            </text>
            <path className="tf-painel__tecla tf-painel__tecla--escura" d="M150 214 L124 226 L124 238 L150 250 Z" />
            <text className="tf-painel__texto-tecla tf-painel__texto-tecla--clara" x="138" y="235" textAnchor="middle">
              NEXT
            </text>
            <circle className="tf-painel__tecla" cx="110" cy="232" r="17" />
            <text className="tf-painel__texto-tecla" x="110" y="230" textAnchor="middle">
              START
            </text>
            <text className="tf-painel__texto-tecla" x="110" y="239" textAnchor="middle">
              STOP
            </text>

            <circle className="tf-painel__liga" cx="168" cy="292" r="16" />
            <path className="tf-painel__icone-liga" d="M162.5 286.5a8 8 0 1 0 11 0M168 282v8" />

            {marcados.map((p) => (
              <circle key={`${p.x}-${p.y}`} className="tf-painel__realce" cx={p.x} cy={p.y} r="22" />
            ))}
          </svg>
          {Object.entries(POSICOES).flatMap(([numero, pontos]) =>
            pontos.map((p) => (
              <button
                key={`${numero}-${p.x}-${p.y}`}
                type="button"
                className="tf-painel__ponto"
                style={{ left: `${(p.x / LARGURA) * 100}%`, top: `${(p.y / ALTURA) * 100}%` }}
                aria-hidden="true"
                tabIndex={-1}
                data-controle={numero}
                onClick={() => alternar(Number(numero))}
              />
            )),
          )}
        </div>
        <p className="tf-sub tf-painel__nota">Painel frontal. Os controles 9 a 14 ficam em outras faces do aparelho.</p>
      </div>

      <div className="tf-pilha">
        <p className="tf-sub" aria-live="polite">
          {escolhido
            ? `Controle ${escolhido.numero}: ${escolhido.nome}. ${escolhido.funcao}`
            : 'Escolha um controle na lista, ou toque no desenho, para ver a função e onde fica.'}
        </p>
        <ol className="tf-controles" aria-label="Controles do aparelho">
          {controles.map((c) => (
            <li key={c.numero}>
              <button
                type="button"
                className="tf-controle"
                aria-pressed={ativo === c.numero}
                onClick={() => alternar(c.numero)}
              >
                <span className="tf-controle__numero" aria-hidden="true">
                  {c.numero}
                </span>
                <span>
                  <span className="tf-controle__nome">{c.nome}</span>
                  <span className="tf-controle__funcao">{c.funcao}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** Par de teclas de intensidade de um canal: seta para cima e para baixo. */
function Canal({ x, rotulo }: { x: number; rotulo: string }) {
  return (
    <g>
      <rect className="tf-painel__canal" x={x - 15} y="140" width="30" height="62" rx="15" />
      <path className="tf-painel__seta" d={`M${x - 7} 160 L${x} 152 L${x + 7} 160`} />
      <path className="tf-painel__seta" d={`M${x - 7} 182 L${x} 190 L${x + 7} 182`} />
      <text className="tf-painel__texto-tecla tf-painel__texto-tecla--canal" x={x} y="216" textAnchor="middle">
        {rotulo}
      </text>
    </g>
  )
}
