import type { Modalidade } from '../atlas/montagens'
import type { ConteudoAparelho } from '../aparelho/conteudoAparelho'
import type { ConteudoCasos } from '../casos/conteudoCasos'
import type { ConteudoSeguranca } from '../seguranca/conteudoSeguranca'
import type { ItemFaq } from '../../shared/ui/PerguntasFrequentes'

export type Fonte = { codigo: string; referencia: string; url: string }

export type Material = { titulo: string; canal: string; url: string; formato: string }

export type ModoEstimulacao = {
  nome: string
  /** Sem valor quando o modo não tem faixa universal (ex.: modulado). */
  faixa: string | null
  resposta: string
}

/** Parâmetro motor com referência educativa (FES). `faixa` só existe quando há número. */
export type CampoEducativo = {
  nome: string
  faixa: string | null
  texto: string
}

export type ExemploEducativo = {
  titulo: string
  contexto: string
  ajustes: string[]
  /** Contas derivadas dos ajustes (tempo de estímulo, ciclo, total). */
  calculo?: string[]
  classificacao?: string
  tarefa?: string
  justificativa?: string
  fonte: string
  limitacoes: string
}

export type Modulo = {
  /** Rota do módulo, sem barra final. */
  base: string
  /** Também é a modalidade na API de conteúdo. */
  sigla: 'TENS' | 'FES'
  numero: string
  titulo: string
  introducao: string
  /** O texto da Visão geral vem da API (página padrão); aqui ficam perguntas, materiais e fontes com link. */
  visaoGeral: { perguntas: ItemFaq[]; materiais?: Material[]; fontes: Fonte[] }
  aparelho?: ConteudoAparelho
  seguranca?: ConteudoSeguranca
  casos?: ConteudoCasos
  eletrodos?: {
    modalidade: Modalidade
    /** Passo a passo da colocação, na ordem em que se faz. */
    comoColocar: string[]
    recomendacoes: string[]
    /** Como ler os códigos dos eletrodos e ligar cabos e canais. */
    identificacao: string[]
    /** Especificação do fabricante: não se mistura com a faixa educativa. */
    doFabricante: string[]
    materiais?: Material[]
    fontes: Fonte[]
  }
  parametros: {
    titulo: string
    aviso: string
    modos?: ModoEstimulacao[]
    notaModos?: string
    campos?: CampoEducativo[]
    exemplos: ExemploEducativo[]
    camposObrigatorios?: string[]
    foraDoEscopo?: string
    /** Faixas do manual do aparelho de referência: especificação, não faixa educativa. */
    doFabricante: { linhas: string[]; fonte: string }
    fontes: Fonte[]
  }
}
