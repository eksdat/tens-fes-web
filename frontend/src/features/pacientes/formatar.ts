/** "1980-05-10" → "10/05/1980" sem passar por Date: evita o dia anterior por causa do fuso. */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Telefone brasileiro enquanto a pessoa digita: só dígitos, até 11, no formato (DD) 99999-9999 ou (DD) 9999-9999. */
export function mascararTelefone(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  const meio = resto.length === 9 ? 5 : 4
  return `(${ddd}) ${resto.slice(0, meio)}-${resto.slice(meio)}`
}

/** DDD de 11 a 99; celular com 9 dígitos começando por 9, fixo com 8 começando de 2 a 5. Mesma regra do backend. */
export const PADRAO_TELEFONE = /^\([1-9][1-9]\) (9\d{4}|[2-5]\d{3})-\d{4}$/

export const telefoneValido = (telefone: string) => PADRAO_TELEFONE.test(telefone)

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
