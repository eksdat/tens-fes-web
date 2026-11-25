import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Botao } from '../shared/ui/Botao'
import { AuthContext } from '../shared/auth/contexto'

const ETAPAS = [
  { rota: '/', alvo: 'titulo-criar-conteudo', titulo: 'Aprenda a criar conteúdo', texto: 'Você pode montar materiais de estudo e enviar para revisão docente, sem sair deste fluxo.' },
  { rota: '/criar-conteudo', alvo: 'onboarding-novo-material', titulo: 'Comece por um novo material', texto: 'Abra a área de conteúdo e escolha Novo material para começar.' },
  { rota: '/criar-conteudo/novo', alvo: 'onboarding-campos-material', titulo: 'Preencha os campos', texto: 'Informe título, modalidade, tema, texto e referências. Nada é gravado neste tutorial.' },
  { rota: '/criar-conteudo/novo', alvo: 'onboarding-salvar-rascunho', titulo: 'Salve como rascunho', texto: 'Quando terminar, use Salvar rascunho. Você poderá continuar editando antes de enviar para revisão.' },
] as const

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [etapa, setEtapa] = useState<number | null>(null)
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [contorno, setContorno] = useState<DOMRect | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const usuarioId = useContext(AuthContext)?.sessao?.user.id
  const exibidos = useRef(new Set<string>())

  useEffect(() => {
    if (!usuarioId || location.pathname !== '/' || exibidos.current.has(usuarioId)) return
    exibidos.current.add(usuarioId)
    const chave = `fisiotech:tutorial-conteudo:${usuarioId}`
    try {
      if (localStorage.getItem(chave)) return
      localStorage.setItem(chave, 'visto')
    } catch {
      // O acesso ao armazenamento pode estar desativado no navegador.
    }
    // A exibição depende da sessão e da leitura do armazenamento do navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEtapa(0)
  }, [usuarioId, location.pathname])

  const fechar = (concluido = false) => {
    setConfirmarSaida(false)
    setEtapa(null)
    requestAnimationFrame(() => document.querySelector<HTMLElement>(concluido ? 'input[name=titulo]' : '[data-onboarding-titulo]')?.focus())
  }

  useEffect(() => {
    if (etapa === null) return
    const aoNavegarParaTras = () => fechar()
    const aoTeclar = (evento: KeyboardEvent) => { if (evento.key === 'Escape' || evento.key === 'Esc') fechar() }
    window.addEventListener('popstate', aoNavegarParaTras)
    window.addEventListener('keydown', aoTeclar)
    return () => { window.removeEventListener('popstate', aoNavegarParaTras); window.removeEventListener('keydown', aoTeclar) }
  }, [etapa])

  useEffect(() => {
    if (etapa === null) return
    const alvoId = ETAPAS[etapa].alvo
    const alvo = alvoId ? document.getElementById(alvoId) : null
    const medir = () => setContorno(alvo?.getBoundingClientRect() ?? null)
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    alvo?.scrollIntoView({ block: 'center', behavior: reduzirMovimento ? 'instant' : 'smooth' })
    medir()
    window.addEventListener('scroll', medir, true)
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('scroll', medir, true)
      window.removeEventListener('resize', medir)
    }
  }, [etapa, location.pathname])

  function proxima() {
    if (etapa === null) return
    const proximaEtapa = etapa + 1
    if (proximaEtapa >= ETAPAS.length) return fechar(true)
    setEtapa(proximaEtapa)
    if (ETAPAS[proximaEtapa].rota !== location.pathname) navigate(ETAPAS[proximaEtapa].rota)
  }

  const atual = etapa === null ? null : ETAPAS[etapa]
  const largura = Math.min(328, window.innerWidth - 24)
  const centro = contorno ? contorno.left + contorno.width / 2 : window.innerWidth / 2
  const esquerda = Math.max(12, Math.min(centro - largura / 2, window.innerWidth - largura - 12))
  const seta = Math.max(18, Math.min(centro - esquerda, largura - 18))
  const abaixo = contorno ? window.innerHeight - contorno.bottom >= 210 || contorno.top < 210 : false
  return <>
    {children}
    {atual && <dialog open className="tf-onboarding" aria-labelledby="onboarding-titulo" aria-describedby="onboarding-texto">
      <div className={contorno ? 'tf-onboarding__contorno' : 'tf-onboarding__fundo'} aria-hidden="true"
        style={contorno ? { left: contorno.left - 5, top: contorno.top - 5, width: contorno.width + 10, height: contorno.height + 10 } : undefined} />
      <section className="tf-onboarding__painel"
        style={contorno ? {
          left: esquerda, right: 'auto',
          top: abaixo ? contorno.bottom + 17 : contorno.top - 17,
          bottom: 'auto', transform: abaixo ? undefined : 'translateY(-100%)',
        } : undefined}>
        {contorno && <span className="tf-onboarding__seta" aria-hidden="true"
          style={{ left: seta, top: abaixo ? -6 : undefined, bottom: abaixo ? undefined : -6 }} />}
        {confirmarSaida ? <>
          <h2 id="onboarding-titulo">Quer mesmo pular o tutorial?</h2>
          <p id="onboarding-texto" className="tf-sub">Você pode acessar a criação de materiais pelo Início.</p>
          <div className="tf-acoes">
            <Botao autoFocus onClick={() => setConfirmarSaida(false)}>Continuar tutorial</Botao>
            <Botao variante="secundario" onClick={() => fechar()}>Pular tutorial</Botao>
          </div>
        </> : <>
          <button className="tf-onboarding__fechar" type="button" aria-label="Fechar tutorial" onClick={() => setConfirmarSaida(true)}>×</button>
          <p className="tf-modulo__kicker">Passo {etapa! + 1} de {ETAPAS.length}</p>
          <h2 id="onboarding-titulo">{atual.titulo}</h2>
          <p id="onboarding-texto" className="tf-sub">{atual.texto}</p>
          <div className="tf-acoes"><Botao autoFocus onClick={proxima}>{etapa! === ETAPAS.length - 1 ? 'Entendi' : 'Próximo'}</Botao></div>
        </>}
      </section>
    </dialog>}
  </>
}
