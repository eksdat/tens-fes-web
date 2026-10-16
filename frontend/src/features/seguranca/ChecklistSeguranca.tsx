import { useState } from 'react'
import type { EtapaChecklist } from './conteudoSeguranca'

/** Checklist marcável. Na aba Segurança o estado fica só na memória; o registro de sessão reaproveita os mesmos itens. */
export function ChecklistSeguranca({ etapas }: { etapas: EtapaChecklist[] }) {
  const [marcados, setMarcados] = useState<Set<string>>(new Set())

  function alternar(chave: string) {
    setMarcados((atuais) => {
      const novos = new Set(atuais)
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
                  const chave = `${etapa}:${item}`
                  return (
                    <li key={item}>
                      <label className="tf-checklist__item">
                        <input type="checkbox" checked={marcados.has(chave)} onChange={() => alternar(chave)} />
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
