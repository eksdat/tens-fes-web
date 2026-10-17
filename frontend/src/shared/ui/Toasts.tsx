import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { IconeAtencao, IconeInfo, IconePerigo, IconeSucesso } from './Icones'
import { ToastsContext, type NovoToast, type Toast, type TipoToast } from './useToast'

const MAXIMO_VISIVEIS = 3
const DURACAO_MS = 8_000

const ICONES = { sucesso: IconeSucesso, info: IconeInfo, atencao: IconeAtencao, erro: IconePerigo }

/** Erro e atenção pedem leitura e decisão: ficam até serem fechados. */
function someSozinho(tipo: TipoToast) {
  return tipo === 'sucesso' || tipo === 'info'
}

export function ToastsProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Toast[]>([])
  const proximoId = useRef(1)

  const mostrar = useCallback((toast: NovoToast) => {
    const id = proximoId.current++
    setTodos((atuais) => [...atuais, { ...toast, id }])
  }, [])

  const fechar = useCallback((id: number) => {
    setTodos((atuais) => atuais.filter((t) => t.id !== id))
  }, [])

  // O excedente espera em fila: só os três mais antigos aparecem e só eles contam tempo.
  const visiveis = useMemo(() => todos.slice(0, MAXIMO_VISIVEIS).reverse(), [todos])
  const valor = useMemo(() => ({ visiveis, mostrar, fechar }), [visiveis, mostrar, fechar])

  return <ToastsContext.Provider value={valor}>{children}</ToastsContext.Provider>
}

/**
 * As duas regiões existem desde o início, vazias: leitor de tela só anuncia o que entra numa região ao vivo
 * que já estava na página. O foco nunca vai para o aviso.
 */
export function RegiaoToasts() {
  const ctx = useContext(ToastsContext)
  if (!ctx) throw new Error('RegiaoToasts precisa estar dentro de <ToastsProvider>')
  const { visiveis, fechar } = ctx

  return (
    <div className="tf-toasts">
      <div role="alert" className="tf-toasts__lista">
        {visiveis
          .filter((t) => t.tipo === 'erro')
          .map((t) => (
            <ItemToast key={t.id} toast={t} aoFechar={fechar} />
          ))}
      </div>
      <output className="tf-toasts__lista">
        {visiveis
          .filter((t) => t.tipo !== 'erro')
          .map((t) => (
            <ItemToast key={t.id} toast={t} aoFechar={fechar} />
          ))}
      </output>
    </div>
  )
}

function ItemToast({ toast, aoFechar }: { toast: Toast; aoFechar: (id: number) => void }) {
  const [comMouse, setComMouse] = useState(false)
  const [comFoco, setComFoco] = useState(false)
  const restante = useRef(DURACAO_MS)
  const pausado = comMouse || comFoco
  const { id, tipo } = toast

  useEffect(() => {
    if (!someSozinho(tipo) || pausado) return
    const inicio = Date.now()
    const timer = setTimeout(() => aoFechar(id), restante.current)
    return () => {
      clearTimeout(timer)
      restante.current -= Date.now() - inicio
    }
  }, [id, tipo, pausado, aoFechar])

  const Icone = ICONES[tipo]
  return (
    <div
      className={`tf-toast${tipo === 'sucesso' ? '' : ` tf-toast--${tipo}`}`}
      onMouseEnter={() => setComMouse(true)}
      onMouseLeave={() => setComMouse(false)}
      onFocus={() => setComFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setComFoco(false)
      }}
    >
      <Icone />
      <div>
        <p className="tf-toast__titulo">{toast.titulo}</p>
        {toast.texto && <p className="tf-toast__texto">{toast.texto}</p>}
        {toast.acao && (
          <button
            type="button"
            className="tf-toast__acao"
            onClick={() => {
              toast.acao?.aoClicar()
              aoFechar(id)
            }}
          >
            {toast.acao.rotulo}
          </button>
        )}
      </div>
      <button type="button" className="tf-toast__fechar" aria-label={`Fechar aviso: ${toast.titulo}`} onClick={() => aoFechar(id)}>
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M4 4l12 12M16 4L4 16" />
        </svg>
      </button>
    </div>
  )
}
