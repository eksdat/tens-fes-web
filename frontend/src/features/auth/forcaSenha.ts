import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import * as dicionarioComum from '@zxcvbn-ts/language-common'
import * as dicionarioPtBr from '@zxcvbn-ts/language-pt-br'

const SCORE_MINIMO = 3

const zxcvbn = new ZxcvbnFactory({
  translations: dicionarioPtBr.translations,
  graphs: dicionarioComum.adjacencyGraphs,
  dictionary: { ...dicionarioComum.dictionary, ...dicionarioPtBr.dictionary },
})

/** Padrão sugerido na tela. Testado: todo exemplo precisa ser aceito pela própria política. */
export const EXEMPLOS_SENHA_FORTE = ['Cafe-Bicicleta-Lua7!', 'Verde-Trem-Oceano#58', 'Meu.Cachorro.Late.9!']

const MOTIVO_GENERICO = 'Está muito previsível. Junte 3 ou 4 palavras sem relação entre si, com número e símbolo.'

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Palavras do nome e do e-mail que a senha não pode conter. */
export function dadosPessoais(nome: string, email: string): string[] {
  const palavrasDoNome = nome.split(/\s+/).filter((p) => p.length >= 3)
  const local = email.split('@')[0]
  const partesDoEmail = local.split(/[._+-]/).filter((p) => p.length >= 3)
  return [...palavrasDoNome, ...(local.length >= 3 ? [local] : []), ...(partesDoEmail.length > 1 ? partesDoEmail : [])]
}

/** Por que a senha foi recusada, ou null se ela passa. */
export function motivoSenhaFraca(senha: string, dados: string[]): string | null {
  const normalizada = normalizar(senha)
  // O zxcvbn só reduz a nota de quem usa o nome; aqui a senha é recusada.
  if (dados.some((dado) => normalizada.includes(normalizar(dado)))) return 'Não use seu nome nem seu e-mail na senha.'
  const { score, feedback } = zxcvbn.check(senha, dados)
  if (score >= SCORE_MINIMO) return null
  return feedback.warning ?? MOTIVO_GENERICO
}

export function senhaFacilDeAdivinhar(senha: string, dados: string[]): boolean {
  return motivoSenhaFraca(senha, dados) !== null
}

export function mensagemSenhaFraca(senha: string, dados: string[]): string | null {
  const motivo = motivoSenhaFraca(senha, dados)
  return motivo && `Essa senha é fácil de adivinhar. ${motivo}`
}
