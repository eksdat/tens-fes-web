import { R1, R3, R5 } from '../modulo/fontes'
import type { Fonte } from '../modulo/tipos'

/** Casos fictícios com respostas comentadas: Guia Técnico, seção 14. */

export type Caso = {
  titulo: string
  enunciado: string
  pergunta?: string
  rotuloResposta: string
  resposta: string[]
  /** Perguntas que a pessoa deve fazer antes de propor algo (caso com dados faltando). */
  perguntarSobre?: string[]
  depois?: string[]
}

export type ConteudoCasos = {
  introducao: string
  casos: Caso[]
  fontes: Fonte[]
}

const INTRODUCAO =
  'Casos fictícios para treinar o raciocínio. Tente responder antes de abrir a resposta comentada. Nenhum valor daqui é prescrição.'

const CASO_DOR_LOCALIZADA: Caso = {
  titulo: 'Caso 1 · Dor localizada e TENS',
  enunciado:
    'Adulto avaliado, com dor no joelho durante uma tarefa, pele íntegra e sensibilidade preservada, sem riscos identificados no cenário. Deseja-se estudar analgesia.',
  pergunta: 'Qual resposta procurar e como registrar?',
  rotuloResposta: 'Resposta comentada',
  resposta: [
    'No exercício de TENS convencional, busque parestesia forte e confortável.',
    'Use os ajustes demonstrativos do exemplo educativo, justifique o posicionamento e registre a dor na mesma tarefa antes e depois.',
    'A intensidade não pode ser definida copiando o mA de outro caso.',
  ],
}

const CASO_QUADRICEPS: Caso = {
  titulo: 'Caso 2 · Contração de quadríceps',
  enunciado:
    'Cenário fictício de ativação muscular sem restrição articular, com contração periférica preservada. A pessoa aplica o exercício A de Parâmetros.',
  pergunta: 'Isso é FES?',
  rotuloResposta: 'Resposta',
  resposta: [
    'Contração isolada caracteriza NMES no contexto apresentado.',
    'Para discutir FES, especifique uma tarefa e a sincronização.',
    'Registre movimento, assistência, tolerância e queda de resposta ao longo dos ciclos.',
  ],
}

const CASO_PE_CAIDO: Caso = {
  titulo: 'Caso 3 · Pé caído',
  enunciado:
    'Pessoa após lesão central com dificuldade para elevar o antepé na marcha. O caso não descreve avaliação periférica nem recursos de sincronização.',
  rotuloResposta: 'Resposta',
  resposta: ['Faltam dados para propor uma configuração funcional.'],
  perguntarSobre: ['Resposta motora', 'Amplitude', 'Segurança da marcha', 'Avaliação profissional', 'Equipamento'],
  depois: ['Não recomende simplesmente “aumentar Hz”.'],
}

const CASO_QUEIMACAO: Caso = {
  titulo: 'Caso 4 · Queimação sob o eletrodo',
  enunciado: 'Durante o exercício, aparece ardência localizada.',
  rotuloResposta: 'Resposta',
  resposta: [
    'Interrompa a saída e inspecione pele, contato e material.',
    'Não normalize a queixa nem compense com maior amplitude.',
  ],
  depois: ['No simulador, o cenário termina e pede o registro da intercorrência.'],
}

export const CASOS_TENS: ConteudoCasos = {
  introducao: INTRODUCAO,
  casos: [CASO_DOR_LOCALIZADA, CASO_QUEIMACAO],
  fontes: [R1],
}

export const CASOS_FES: ConteudoCasos = {
  introducao: INTRODUCAO,
  casos: [CASO_QUADRICEPS, CASO_PE_CAIDO, CASO_QUEIMACAO],
  fontes: [R3, R5],
}
