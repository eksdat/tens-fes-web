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
  fichas?: FichaCaso[]
}

export type FichaCaso = {
  id: string
  versao: string
  titulo: string
  modalidade: 'TENS' | 'FES'
  contexto: string
  criteriosEssenciais: string[]
  parametrosReportados: string[]
  valoresAusentes: string[]
  limites: string[]
  fonte: Fonte
  simulador?: { modalidade: 'TENS' | 'FES'; modo: string; largura?: number; frequencia?: number }
}

export const FICHAS_CASOS: FichaCaso[] = [
  {
    id: 'fast-fibromialgia', versao: '1.0.0', titulo: 'FAST · fibromialgia e dor ao movimento', modalidade: 'TENS',
    contexto: 'Ensaio randomizado em mulheres com fibromialgia; TENS durante atividade para dor evocada pelo movimento.',
    criteriosEssenciais: ['fibromialgia confirmada', 'tarefa de movimento definida', 'dor durante a tarefa registrada'],
    parametrosReportados: ['onda bifásica assimétrica', 'frequência modulada de 2–125 Hz', 'largura de pulso de 200 µs', 'intensidade máxima tolerável', 'orientação de uso durante atividade por pelo menos 2 h/dia durante 4 semanas'],
    valoresAusentes: ['intensidade inicial ou final fixa em mA'],
    limites: ['A modulação 2–125 Hz e o uso domiciliar não são reproduzidos pelo simulador.', 'O caso é educativo; não prescreve intensidade nem duração.'],
    fonte: { codigo: 'FAST', referencia: 'Dailey et al. A Randomized Controlled Trial of TENS for Movement-Evoked Pain in Women with Fibromyalgia, 2020.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7188591/' },
    simulador: { modalidade: 'TENS', modo: 'Normal', largura: 200 },
  },
  {
    id: 'pmc9773873-dorsiflexao', versao: '1.0.0', titulo: 'PMC9773873 · dorsiflexão após AVC subagudo', modalidade: 'FES',
    contexto: 'Ensaio randomizado de FES controlada contralateralmente versus NMES em pessoas com AVC subagudo, para função do membro inferior.',
    criteriosEssenciais: ['fase pós-AVC subagudo confirmada', 'tarefa de dorsiflexão definida', 'controle/acionamento contralateral disponível'],
    parametrosReportados: ['equipamento DC-L-500', 'onda retangular bifásica, 35 pps e 200 µs', 'acionamento pela dorsiflexão de pelo menos 15° do lado não parético', '10 s de movimento sustentado e intervalo de 10 s', '20 min/sessão, 5 dias/semana, por 3 semanas'],
    valoresAusentes: ['intensidade individual em mA', 'faixa operacional do equipamento', 'tempos de rampa'],
    limites: ['O simulador não representa sensor de ângulo nem acionamento contralateral.', 'A intensidade começa em zero; a simulação é parcial e não reproduz a lógica CCFES.'],
    fonte: { codigo: 'PMC9773873', referencia: 'Huang S, Zhang Y, Liu P, Chen Y, Gao B, Chen C, Bai Y. Front Neurol. 2022;13:1010975.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9773873/' },
  },
]

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
  fontes: [R1, FICHAS_CASOS[0].fonte],
  fichas: [FICHAS_CASOS[0]],
}

export const CASOS_FES: ConteudoCasos = {
  introducao: INTRODUCAO,
  casos: [CASO_QUADRICEPS, CASO_PE_CAIDO, CASO_QUEIMACAO],
  fontes: [R3, R5, FICHAS_CASOS[1].fonte],
  fichas: [FICHAS_CASOS[1]],
}
