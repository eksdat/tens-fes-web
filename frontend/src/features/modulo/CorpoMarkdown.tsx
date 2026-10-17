import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** O corpo fica dentro de um bloco com título h3: `#` vira h3 e `##` vira h4, para não pular nível. */
const COMPONENTES: Components = {
  h1: ({ children }) => <h3 className="tf-cartao__titulo">{children}</h3>,
  h2: ({ children }) => <h4 className="tf-cartao__titulo">{children}</h4>,
  h3: ({ children }) => <h5 className="tf-cartao__titulo">{children}</h5>,
  h4: ({ children }) => <h6 className="tf-cartao__titulo">{children}</h6>,
  a: ({ href, children }) =>
    href ? (
      <a className="tf-link" href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="tf-sr-only"> (abre em outra aba)</span>
      </a>
    ) : (
      <span>{children}</span>
    ),
}

/** Só http e https; o resto (javascript:, data:, caminho relativo) perde o link. */
function urlSegura(url: string) {
  return /^https?:\/\//i.test(url) ? url : ''
}

/** Markdown sem HTML cru: tags no texto são descartadas, nunca executadas (SEGURANCA.md, seção 5). */
export function CorpoMarkdown({ texto }: { texto: string }) {
  return (
    <div className="tf-markdown">
      <Markdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={urlSegura} components={COMPONENTES}>
        {texto}
      </Markdown>
    </div>
  )
}
