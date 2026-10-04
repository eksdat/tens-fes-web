import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { ErroDeCampo } from '../../shared/ui/ErroDeCampo'

const TAMANHO = 6

/**
 * Código de 6 dígitos em caixas separadas. Digitar avança, apagar volta, colar ou o preenchimento automático do
 * celular distribuem os dígitos. Cada caixa tem rótulo próprio para leitor de tela; o grupo tem a legenda.
 */
export function CampoCodigo({
  onChange,
  erro,
  rotulo = 'Código de 6 dígitos',
}: {
  onChange: (codigo: string) => void
  erro?: string
  rotulo?: string
}) {
  const idErro = `${useId()}-erro`
  const [digitos, setDigitos] = useState<string[]>(() => Array(TAMANHO).fill(''))
  const caixas = useRef<(HTMLInputElement | null)[]>([])

  function atualizar(proximos: string[]) {
    setDigitos(proximos)
    onChange(proximos.join(''))
  }

  function foco(indice: number) {
    const alvo = caixas.current[Math.min(Math.max(indice, 0), TAMANHO - 1)]
    alvo?.focus()
    alvo?.select()
  }

  function preencher(aPartirDe: number, texto: string) {
    const novos = texto.replace(/\D/g, '').slice(0, TAMANHO - aPartirDe).split('')
    if (novos.length === 0) return
    const proximos = [...digitos]
    novos.forEach((d, i) => (proximos[aPartirDe + i] = d))
    atualizar(proximos)
    foco(aPartirDe + novos.length)
  }

  function aoDigitar(indice: number, texto: string) {
    if (!texto) {
      const proximos = [...digitos]
      proximos[indice] = ''
      return atualizar(proximos)
    }
    preencher(indice, texto)
  }

  function aoTeclar(indice: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digitos[indice] && indice > 0) {
      e.preventDefault()
      const proximos = [...digitos]
      proximos[indice - 1] = ''
      atualizar(proximos)
      foco(indice - 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      foco(indice - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      foco(indice + 1)
    }
  }

  function aoColar(indice: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    preencher(indice, e.clipboardData.getData('text'))
  }

  return (
    <fieldset className={`tf-field tf-codigo${erro ? ' tf-field--erro' : ''}`} aria-describedby={erro ? idErro : undefined}>
      <legend className="tf-field__label">{rotulo}</legend>
      <div className="tf-codigo__caixas">
        {digitos.map((digito, i) => (
          <input
            // eslint-disable-next-line react/no-array-index-key -- seis posições fixas
            key={i}
            ref={(el) => {
              caixas.current[i] = el
            }}
            className="tf-codigo__caixa"
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={i === 0 ? TAMANHO : 1}
            aria-label={`Dígito ${i + 1} de ${TAMANHO}`}
            aria-invalid={erro ? true : undefined}
            value={digito}
            onChange={(e) => aoDigitar(i, e.target.value)}
            onKeyDown={(e) => aoTeclar(i, e)}
            onPaste={(e) => aoColar(i, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      {erro && <ErroDeCampo id={idErro}>{erro}</ErroDeCampo>}
    </fieldset>
  )
}
