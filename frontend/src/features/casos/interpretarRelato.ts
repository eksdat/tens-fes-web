import type { FichaCaso } from './conteudoCasos'

export type InterpretacaoRelato = { ficha?: FichaCaso; faltantes: string[]; confirmacao: string }

const normalizar = (texto: string) => texto.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const MOVIMENTO = /\b(caminh\w*|and[ao]\w*|escadas?|levantar|tarefa de movimento)\b/
const DOR = /\b(dor(?:es)?|dolor\w*)\b/
const AVC = /\b(avc|acidente vascular cerebral)\b/
const FIBROMIALGIA = /\bfibromialgia\b/
const TERCEIRO_OU_REFERENCIA = /\b(?:historico familiar|(?:meu|minha)\s+(?:mae|pai|irmao|irma|avo|avoa|filho|filha|esposa|marido)|li sobre|ouvi falar|estudei|pesquisei|exemplo de)\b/

const CRITERIOS: Record<string, RegExp[]> = {
  'fibromialgia confirmada': [FIBROMIALGIA],
  'tarefa de movimento definida': [MOVIMENTO],
  'dor durante a tarefa registrada': [MOVIMENTO, DOR],
  'fase pós-AVC subagudo confirmada': [AVC, /\bsubagud[oa]\b/],
  'tarefa de dorsiflexão definida': [/\b(dorsiflexao|pe caido|levantar a ponta do pe|elevar a ponta do pe)\b/],
  'controle/acionamento contralateral disponível': [/\b(acionamento contralateral|controle contralateral|(?:acionar|ativar|disparar) com o lado nao paretico)\b/],
}

function afirmacao(frase: string, termo: RegExp) {
  return [...frase.matchAll(new RegExp(termo.source, 'g'))].some((achado) => {
    const antes = frase.slice(0, achado.index).trimEnd()
    const depois = frase.slice(achado.index + achado[0].length).trimStart()
    return !/\b(nao|sem|neg[ao]|suspeita|possivel|talvez|duvida|descartou|no tengo|sin|without|no history of)(?:\s+\w+){0,5}$/.test(antes)
      && !/^(?:(?:e|esta|foi|seria|ainda)\s+)*(?:nao\b|incert[oa]\w*|indisponivel|descartad[oa]|suspeit[oa]|a confirmar|em investigacao)\b/.test(depois)
  })
}

export function interpretarRelato(relato: string, fichas: FichaCaso[]): InterpretacaoRelato {
  const frases = normalizar(relato)
    .replace(/\r?\n[ \t]+(?=[a-z])/g, ' ')
    .replace(/\b((?:ao|quando|durante)\s+[^.!?,;\n]+),/g, '$1 ')
    .split(/(?<=[.!?])\s*|[,;\n]+|\b(?:mas|porem|contudo)\b/)
    .filter((frase) => !frase.endsWith('?') && !TERCEIRO_OU_REFERENCIA.test(frase))
  const populacao = (modalidade: FichaCaso['modalidade']) => modalidade === 'TENS' ? FIBROMIALGIA : AVC
  const ficha = fichas.find((item) => frases.some((frase) => afirmacao(frase, populacao(item.modalidade))))
  if (!ficha) return { faltantes: ['condição ou objetivo do caso', 'tarefa de aplicação'], confirmacao: 'Não identifiquei uma ficha com segurança.' }
  const faltantes = ficha.criteriosEssenciais.filter((criterio) =>
    !frases.some((frase) => (
      !(criterio === 'dor durante a tarefa registrada' && /\b(?:em|no|durante o) repouso\b/.test(frase))
      && CRITERIOS[criterio]?.every((termo) => afirmacao(frase, termo))
    )),
  )
  return { ficha, faltantes, confirmacao: faltantes.length ? 'Confirme ou complemente os critérios essenciais antes de abrir o simulador.' : 'Critérios essenciais identificados; confira a ficha e os limites antes de abrir.' }
}
