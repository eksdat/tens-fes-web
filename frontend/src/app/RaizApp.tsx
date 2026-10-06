import { useEffect } from 'react'
import { Outlet, useMatches } from 'react-router'

/**
 * Raiz de todas as rotas: link "Pular para o conteúdo" como primeiro item do foco e título por página. O app
 * troca de tela sem recarregar, então o leitor de tela só percebe a mudança pela região `status` e pelo `document.title`.
 */
export function RaizApp() {
  const titulo = useMatches()
    .map((rota) => (rota.handle as { titulo?: string } | undefined)?.titulo)
    .findLast(Boolean)
  const tituloCompleto = titulo ? `${titulo} · Fisiotech` : 'Fisiotech'

  useEffect(() => {
    document.title = tituloCompleto
  }, [tituloCompleto])

  return (
    <>
      <a
        className="tf-pular"
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('conteudo')?.focus()
        }}
      >
        Pular para o conteúdo
      </a>
      <Outlet />
      <output className="tf-sr-only">
        {tituloCompleto}
      </output>
    </>
  )
}
