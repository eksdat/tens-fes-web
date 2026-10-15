import { RadioGroup, Switch } from 'radix-ui'
import { useState } from 'react'
import { Botao } from '../ui/Botao'
import { Dialogo } from '../ui/Dialogo'
import { IconeAcessibilidade } from '../ui/Icones'
import {
  aplicarPreferencias,
  lerPreferencias,
  PADRAO,
  salvarPreferencias,
  type Preferencias,
  type TamanhoTexto,
} from './preferencias'

const TAMANHOS: { valor: TamanhoTexto; rotulo: string }[] = [
  { valor: 'normal', rotulo: 'Normal' },
  { valor: 'grande', rotulo: 'Grande' },
  { valor: 'muito-grande', rotulo: 'Muito grande' },
]

export function BotaoAcessibilidade() {
  const [preferencias, setPreferencias] = useState(lerPreferencias)

  function mudar(parcial: Partial<Preferencias>) {
    const novas = { ...preferencias, ...parcial }
    setPreferencias(novas)
    aplicarPreferencias(novas)
    salvarPreferencias(novas)
  }

  return (
    <Dialogo
      titulo="Acessibilidade"
      descricao="Os ajustes ficam salvos neste navegador."
      gatilho={
        <button type="button" className="tf-acessibilidade" aria-label="Acessibilidade" title="Acessibilidade">
          <IconeAcessibilidade />
        </button>
      }
      acoes={
        <Botao variante="secundario" onClick={() => mudar(PADRAO)}>
          Restaurar padrão
        </Botao>
      }
    >
      <div className="tf-ajustes">
        <div>
          <p id="ajuste-tamanho" className="tf-ajustes__rotulo">
            Tamanho do texto
          </p>
          <RadioGroup.Root
            className="tf-opcoes"
            aria-labelledby="ajuste-tamanho"
            value={preferencias.tamanho}
            onValueChange={(valor) => mudar({ tamanho: valor as TamanhoTexto })}
          >
            {TAMANHOS.map(({ valor, rotulo }) => (
              <label key={valor} className="tf-opcoes__item">
                <RadioGroup.Item className="tf-opcoes__radio" value={valor}>
                  <RadioGroup.Indicator className="tf-opcoes__marca" />
                </RadioGroup.Item>
                {rotulo}
              </label>
            ))}
          </RadioGroup.Root>
        </div>

        <Ajuste
          id="ajuste-contraste"
          rotulo="Alto contraste"
          dica="Cores mais fortes e bordas pretas."
          ligado={preferencias.altoContraste}
          aoMudar={(altoContraste) => mudar({ altoContraste })}
        />
        <Ajuste
          id="ajuste-movimento"
          rotulo="Reduzir movimento"
          dica="Desliga animações e transições."
          ligado={preferencias.semMovimento}
          aoMudar={(semMovimento) => mudar({ semMovimento })}
        />
      </div>
    </Dialogo>
  )
}

type AjusteProps = {
  id: string
  rotulo: string
  dica: string
  ligado: boolean
  aoMudar: (ligado: boolean) => void
}

function Ajuste({ id, rotulo, dica, ligado, aoMudar }: AjusteProps) {
  return (
    <div className="tf-ajuste">
      <div>
        <label className="tf-ajustes__rotulo" htmlFor={id}>
          {rotulo}
        </label>
        <p id={`${id}-dica`} className="tf-ajuste__dica">
          {dica}
        </p>
      </div>
      <Switch.Root
        id={id}
        className="tf-chave"
        checked={ligado}
        onCheckedChange={aoMudar}
        aria-describedby={`${id}-dica`}
      >
        <Switch.Thumb className="tf-chave__bola" />
      </Switch.Root>
    </div>
  )
}
