import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import * as dicionarioComum from '@zxcvbn-ts/language-common'
import * as dicionarioPtBr from '@zxcvbn-ts/language-pt-br'

const SCORE_MINIMO = 3

const zxcvbn = new ZxcvbnFactory({
  translations: dicionarioPtBr.translations,
  graphs: dicionarioComum.adjacencyGraphs,
  dictionary: { ...dicionarioComum.dictionary, ...dicionarioPtBr.dictionary },
})

export const MENSAGEM_SENHA_FACIL =
  'Essa senha é fácil de adivinhar. Evite sequências, palavras comuns e seus dados pessoais.'

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

// O zxcvbn só reduz a nota de quem usa o nome; aqui a senha é recusada.
export function senhaFacilDeAdivinhar(senha: string, dados: string[]): boolean {
  const normalizada = normalizar(senha)
  if (dados.some((dado) => normalizada.includes(normalizar(dado)))) return true
  return zxcvbn.check(senha, dados).score < SCORE_MINIMO
}
