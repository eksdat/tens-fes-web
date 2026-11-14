/**
 * Dados fictícios dos testes ponta a ponta. As contas são as personas do grupo (card "Criar personas"); nenhum dado
 * é de pessoa ou paciente real.
 */

export type Perfil = 'ESTUDANTE' | 'PROFISSIONAL'

export type Conta = {
  id: string
  email: string
  senha: string
  nome: string
  perfil: Perfil
  /** Estudante. */
  instituicao?: string
  periodo?: number
  /** Profissional. */
  categoria?: 'FISIOTERAPEUTA' | 'TERAPEUTA_OCUPACIONAL' | 'OUTRA'
  registro?: string
  uf?: string
  /** Conta com aplicativo autenticador: o login pede o código de 6 dígitos. */
  autenticador?: boolean
  /** Docente que aprova ou devolve conteúdo (só PROFISSIONAL). */
  revisor?: boolean
  /** Sem cadastro na API (GET /usuarios/me responde 404): caso de quem acabou de confirmar o e-mail. */
  semCadastro?: boolean
  /** Guardado no Supabase ao criar a conta (user_metadata.cadastro). */
  cadastroGuardado?: Record<string, unknown>
}

/** Código que o autenticador falso aceita. */
export const CODIGO_AUTENTICADOR = '123456'

export const SININHO: Conta = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'sininho@exemplo.com',
  senha: 'Pozinho-Dourado-Voa7!',
  nome: 'Sininho',
  perfil: 'ESTUDANTE',
  instituicao: 'UniBH',
  periodo: 5,
}

export const PETER_PAN: Conta = {
  id: '00000000-0000-4000-8000-000000000002',
  email: 'peter.pan@exemplo.com',
  senha: 'Sombra-Fujona-Terra9#',
  nome: 'Peter Pan',
  perfil: 'ESTUDANTE',
  instituicao: 'UniBH',
  periodo: 3,
}

export const GANCHO: Conta = {
  id: '00000000-0000-4000-8000-000000000003',
  email: 'gancho@exemplo.com',
  senha: 'Relogio-Crocodilo-Tic4$',
  nome: 'Capitão Gancho',
  perfil: 'PROFISSIONAL',
  categoria: 'FISIOTERAPEUTA',
  registro: '123456-F',
  uf: 'MG',
  autenticador: true,
}

export const WENDY: Conta = {
  id: '00000000-0000-4000-8000-000000000004',
  email: 'wendy@exemplo.com',
  senha: 'Agulha-Linha-Sombra5!',
  nome: 'Wendy Darling',
  perfil: 'PROFISSIONAL',
  categoria: 'FISIOTERAPEUTA',
  registro: '654321-F',
  uf: 'MG',
  autenticador: true,
  revisor: true,
}

/** Faixas do simulador, iguais às da migration V7 (guia técnico e manual do Neurodyn Portable). */
type Faixa = {
  modalidade: string
  modo: string
  parametro: string
  unidade: string
  unidadeExtenso: string
  origem: 'EDUCATIVA' | 'APARELHO'
  minimo: number
  maximo: number
  fonte: string
}

const UNIDADES: Record<string, [string, string]> = {
  'Frequência': ['Hz', 'hertz'],
  'Largura de pulso': ['µs', 'microssegundos'],
  'Intensidade': ['mA', 'miliampères'],
  'Rampa de subida': ['s', 'segundos'],
  'Platô': ['s', 'segundos'],
  'Rampa de descida': ['s', 'segundos'],
  'Repouso (tempo OFF)': ['s', 'segundos'],
}

function faixa(modalidade: string, modo: string, parametro: string, origem: Faixa['origem'], minimo: number, maximo: number): Faixa {
  const [unidade, unidadeExtenso] = UNIDADES[parametro]
  const fonte = origem === 'EDUCATIVA' ? 'Guia técnico TENS + FES.' : 'Manual do Neurodyn Portable (M1).'
  return { modalidade, modo, parametro, unidade, unidadeExtenso, origem, minimo, maximo, fonte }
}

export const FAIXAS: Record<string, Faixa[]> = {
  TENS: [
    faixa('TENS', 'Convencional', 'Frequência', 'EDUCATIVA', 50, 100),
    faixa('TENS', 'Convencional', 'Largura de pulso', 'EDUCATIVA', 50, 200),
    faixa('TENS', 'Acupuntura', 'Frequência', 'EDUCATIVA', 2, 4),
    faixa('TENS', 'Acupuntura', 'Largura de pulso', 'EDUCATIVA', 100, 400),
    faixa('TENS', 'Normal', 'Frequência', 'APARELHO', 0.5, 250),
    faixa('TENS', 'Normal', 'Largura de pulso', 'APARELHO', 50, 500),
    faixa('TENS', 'Normal', 'Intensidade', 'APARELHO', 0, 100),
    faixa('TENS', 'Convencional', 'Frequência', 'APARELHO', 60, 100),
    faixa('TENS', 'Convencional', 'Largura de pulso', 'APARELHO', 50, 150),
    faixa('TENS', 'Convencional', 'Intensidade', 'APARELHO', 0, 100),
    faixa('TENS', 'Acupuntura', 'Frequência', 'APARELHO', 1, 10),
    faixa('TENS', 'Acupuntura', 'Largura de pulso', 'APARELHO', 150, 250),
    faixa('TENS', 'Acupuntura', 'Intensidade', 'APARELHO', 0, 100),
    faixa('TENS', 'Burst', 'Largura de pulso', 'APARELHO', 50, 500),
    faixa('TENS', 'Burst', 'Intensidade', 'APARELHO', 0, 100),
  ],
  FES: [
    faixa('FES', 'FES', 'Frequência', 'EDUCATIVA', 20, 50),
    faixa('FES', 'FES', 'Largura de pulso', 'EDUCATIVA', 200, 400),
    faixa('FES', 'FES', 'Frequência', 'APARELHO', 0.5, 250),
    faixa('FES', 'FES', 'Largura de pulso', 'APARELHO', 50, 500),
    faixa('FES', 'FES', 'Intensidade', 'APARELHO', 0, 100),
    faixa('FES', 'FES', 'Rampa de subida', 'APARELHO', 1, 20),
    faixa('FES', 'FES', 'Platô', 'APARELHO', 1, 60),
    faixa('FES', 'FES', 'Rampa de descida', 'APARELHO', 1, 20),
    faixa('FES', 'FES', 'Repouso (tempo OFF)', 'APARELHO', 1, 60),
  ],
}

/** Conteúdo como a API guarda (tabela conteudo). */
export type ConteudoFalso = {
  id: number
  titulo: string
  modalidade: 'TENS' | 'NMES' | 'FES'
  secao: string
  bloco: string | null
  corpo: string
  referencias: string | null
  versao: number
  estado: 'RASCUNHO' | 'EM_REVISAO' | 'APROVADO' | 'ARQUIVADO'
  dataRevisao: string | null
  motivoDevolucao: string | null
}

/**
 * No lugar do guia técnico, textos curtos e fictícios, todos em revisão como no banco: os cinco blocos da Visão
 * geral de TENS e de FES e um caso de FES sem fonte.
 */
export function conteudosIniciais(): ConteudoFalso[] {
  const blocos = (modalidade: 'TENS' | 'FES') =>
    [
      ['O_QUE_E', `O que é ${modalidade}`],
      ['PARA_QUE_SERVE', 'Para que serve'],
      ['COMO_INTERPRETAR', 'Como interpretar'],
      ['EXEMPLO', 'Exemplo didático'],
      ['CUIDADOS', 'Cuidados'],
    ].map(([bloco, titulo]) => ({ modalidade, secao: 'VISAO_GERAL', bloco, titulo, referencias: 'Guia técnico TENS + FES' }))
  const caso = { modalidade: 'FES' as const, secao: 'CASOS', bloco: null, titulo: 'Caso do pé caído', referencias: null }
  return [...blocos('TENS'), ...blocos('FES'), caso].map((c, i) => ({
    ...c,
    id: i + 1,
    corpo: `Texto de teste: ${c.titulo.toLowerCase()}.`,
    versao: 1,
    estado: 'EM_REVISAO',
    dataRevisao: null,
    motivoDevolucao: null,
  }))
}
