import { useState } from 'react'
import type { EtapaChecklist } from './conteudoSeguranca'

type Props = {
  etapas: EtapaChecklist[]
  /** Códigos dos itens marcados. Controlado pelo registro de sessão, que os salva; sem isto (aba Segurança), o estado fica só na memória. */
  marcados?: Set<string>
  aoAlternar?: (codigo: string) => void
}

export function ChecklistSeguranca({ etapas, marcados, aoAlternar }: Props) {
  const [locais, setLocais] = useState<Set<string>>(new Set())
  const atuais = marcados ?? locais

  function alternar(codigo: string) {
    if (aoAlternar) {
      aoAlternar(codigo)
      return
    }
    setLocais((anteriores) => {
      const novos = new Set(anteriores)
      if (novos.has(codigo)) novos.delete(codigo)
      else novos.add(codigo)
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
                {grupo.itens.map(({ codigo, texto }) => (
                  <li key={codigo}>
                    <label className="tf-checklist__item">
                      <input type="checkbox" checked={atuais.has(codigo)} onChange={() => alternar(codigo)} />
                      {texto}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </fieldset>
      ))}
    </section>
  )
}
