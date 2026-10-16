/** "1980-05-10" → "10/05/1980" sem passar por Date: evita o dia anterior por causa do fuso. */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Só letras sem acento, dígitos, hífen, ponto e sublinhado, em maiúscula. */
export const limparIdentificador = (texto: string) =>
  texto
    .toUpperCase()
    .replace(/[^A-Z0-9._-]/g, '')
    .slice(0, 40)

/** 11 dígitos (com ou sem pontuação) parecem CPF: o ambiente é acadêmico, então recusa. */
export const pareceDocumento = (texto: string) => /^\d{11}$/.test(texto.replace(/[.\-/\s]/g, ''))

/** Letras (com acento), espaço, apóstrofo e hífen. Dígito e símbolo não entram no nome. */
export const limparNome = (texto: string) => texto.replace(/[^\p{L}\s'’-]/gu, '')
