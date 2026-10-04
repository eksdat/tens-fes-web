const CHAVE_MANTER = 'fisiotech.manter-conectado'

/** Guarda a escolha do checkbox "Manter conectado" do login. Sem escolha, a sessão vive só na aba. */
export function definirManterConectado(manter: boolean) {
  try {
    localStorage.setItem(CHAVE_MANTER, manter ? '1' : '0')
  } catch {
    // Armazenamento bloqueado pelo navegador: a sessão simplesmente não persiste.
  }
}

function manter(): boolean {
  try {
    return localStorage.getItem(CHAVE_MANTER) === '1'
  } catch {
    return false
  }
}

/**
 * Armazenamento de sessão do supabase-js. Marcado "Manter conectado": localStorage (sobrevive ao fechar o
 * navegador). Desmarcado: sessionStorage (some ao fechar a aba). Ao ler, olha os dois, pois quem lê pode
 * não ser quem gravou (recarregar a página, abrir o link do e-mail em outra aba).
 */
export const armazenamentoDaSessao = {
  getItem(chave: string): string | null {
    return sessionStorage.getItem(chave) ?? localStorage.getItem(chave)
  },
  setItem(chave: string, valor: string) {
    const [alvo, outro] = manter() ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
    alvo.setItem(chave, valor)
    outro.removeItem(chave)
  },
  removeItem(chave: string) {
    sessionStorage.removeItem(chave)
    localStorage.removeItem(chave)
  },
}
