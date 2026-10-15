import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Usuario } from '../features/usuario/useUsuarioAtual'
import { Dialogo } from '../shared/ui/Dialogo'
import { IconeLupa } from '../shared/ui/Icones'
import { atalhosDoPerfil, filtrarAtalhos, type Atalho } from './atalhos'

type Props = { perfil: Usuario['perfil'] | undefined; aoSair: () => void }

export function BuscaRapida({ perfil, aoSair }: Props) {
  const [aberto, setAberto] = useState(false)
  const navegar = useNavigate()

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAberto(true)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])

  function escolher(atalho: Atalho) {
    setAberto(false)
    if (atalho.para) void navegar(atalho.para)
    else aoSair()
  }

  return (
    <Dialogo
      titulo="Busca rápida"
      aberto={aberto}
      aoFechar={() => setAberto(false)}
      gatilho={
        <button
          type="button"
          className="tf-menu__icone"
          aria-label="Busca rápida"
          aria-keyshortcuts="Control+K"
          title="Busca rápida (Ctrl+K)"
          onClick={() => setAberto(true)}
        >
          <IconeLupa />
        </button>
      }
    >
      <Painel atalhos={atalhosDoPerfil(perfil)} aoEscolher={escolher} />
    </Dialogo>
  )
}

/** Componente próprio para o texto digitado zerar a cada abertura (o diálogo desmonta o conteúdo ao fechar). */
function Painel({ atalhos, aoEscolher }: { atalhos: Atalho[]; aoEscolher: (a: Atalho) => void }) {
  const campo = useRef<HTMLInputElement>(null)
  const [consulta, setConsulta] = useState('')
  const resultados = filtrarAtalhos(atalhos, consulta)

  useEffect(() => campo.current?.focus(), [])

  return (
    <div className="tf-busca">
      <input
        ref={campo}
        className="tf-busca__campo"
        type="search"
        aria-label="Buscar módulo ou ação"
        placeholder="Digite um módulo ou ação"
        autoComplete="off"
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && resultados.length > 0) aoEscolher(resultados[0])
        }}
      />
      {resultados.length === 0 ? (
        <output className="tf-busca__vazio">Nada encontrado.</output>
      ) : (
        <ul className="tf-busca__lista">
          {resultados.map((atalho) => (
            <li key={atalho.rotulo}>
              <button type="button" className="tf-busca__item" onClick={() => aoEscolher(atalho)}>
                <span>{atalho.rotulo}</span>
                <span className="tf-busca__grupo">{atalho.grupo}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
