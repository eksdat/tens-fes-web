/**
 * Abre o anexo numa aba nova pelo link temporário (5 minutos). A aba abre antes de buscar o link: aberta depois do
 * await, o navegador a trataria como pop-up e bloquearia. Devolve false se o link não veio.
 */
export async function abrirAnexo(buscarLink: () => Promise<{ url: string }>): Promise<boolean> {
  const aba = window.open('', '_blank')
  try {
    const { url } = await buscarLink()
    if (aba) {
      // A aba nova não precisa (nem deve) controlar esta página.
      aba.opener = null
      aba.location.href = url
    } else {
      window.location.assign(url)
    }
    return true
  } catch {
    aba?.close()
    return false
  }
}
