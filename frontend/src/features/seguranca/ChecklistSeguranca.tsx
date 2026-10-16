import { useState } from 'react'
import type { EtapaChecklist } from './conteudoSeguranca'

type Props = {
  etapas: EtapaChecklist[]
  /** Controlado pelo registro de sessão, que salva os itens. Sem isto (aba Segurança), o estado fica só na memória. */
  marcados?: Set<string>
  aoAlternar?: (chave: string) => void
}

/** Chave de um item: "Etapa:texto", o mesmo formato gravado na sessão. */
const chaveDoItem = (etapa: string, item: string) => `${etapa}:${item}`

export function ChecklistSeguranca({ etapas, marcados, aoAlternar }: Props) {
  const [locais, setLocais] = useState<Set<string>>(new Set())
  const atuais = marcados ?? locais

  function alternar(chave: string) {
    if (aoAlternar) {
      aoAlternar(chave)
      return
    }
    setLocais((anteriores) => {
      const novos = new Set(anteriores)
      if (novos.has(chave)) novos.delete(chave)
      else novos.add(chave)
      return novos
    })
  }

  return (
    <section className="tf-pilha" aria-labelledby="checklist-seguranca">
      <h3 id="checklist-seguranca" className="tf-subtitulo">
        Checklist de segurança
      </h3>
      {etapas.map(({ etapa, grupos }) => (
        <fieldset key={etapa} className="tf-checklist">
          <legend className="tf-checklist__etapa">{etapa}</legend>
          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="tf-checklist__grupo">
              <h4 className="tf-cartao__titulo">{grupo.titulo}</h4>
              <ul className="tf-checklist__itens">
                {grupo.itens.map((item) => {
                  const chave = chaveDoItem(etapa, item)
                  return (
                    <li key={item}>
                      <label className="tf-checklist__item">
                        <input type="checkbox" checked={atuais.has(chave)} onChange={() => alternar(chave)} />
                        {item}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </fieldset>
      ))}
    </section>
  )
}
