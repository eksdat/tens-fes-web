import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Alerta } from '../../shared/ui/Alerta'
import { BotaoLink } from '../../shared/ui/Botao'
import { Marca } from '../../shared/ui/Marca'

export type SecaoLegal = { titulo: string; paragrafos: string[] }

/** Página de texto longo (termos e privacidade): abre em outra aba a partir do cadastro e leva de volta a ele. */
export function DocumentoLegal({ titulo, secoes, outro }: { titulo: string; secoes: SecaoLegal[]; outro: ReactNode }) {
  return (
    <main id="conteudo" tabIndex={-1} className="tf-pagina tf-documento">
      <Link className="tf-link" to="/cadastro">
        <span aria-hidden="true">‹&nbsp;</span>Voltar
      </Link>
      <Marca />
      <h1 className="tf-titulo">{titulo}</h1>
      <Alerta titulo="Versão preliminar">
        Texto em revisão antes do lançamento. Pode mudar; avisaremos quem já tem conta quando mudar.
      </Alerta>
      {secoes.map((secao) => (
        <section key={secao.titulo} className="tf-pilha">
          <h2 className="tf-subtitulo">{secao.titulo}</h2>
          {secao.paragrafos.map((p) => (
            <p key={p} className="tf-sub">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="tf-sub">{outro}</p>
      <div className="tf-linha">
        <BotaoLink to="/cadastro" variante="primario">
          Voltar ao cadastro
        </BotaoLink>
        <BotaoLink to="/login" variante="ghost">
          Ir para entrar
        </BotaoLink>
      </div>
    </main>
  )
}
