import { z } from 'zod'
import type { components } from '../../shared/api/schema'
import { emailSchema, senhaNovaSchema } from './schemas'

export type CadastroRequest = components['schemas']['CadastroRequest']
type Categoria = NonNullable<CadastroRequest['categoria']>
type Uf = NonNullable<CadastroRequest['uf']>

/** Sugestões do campo de instituição; o aluno pode digitar qualquer outra. */
export const INSTITUICOES = ['UniBH', 'PUC Minas', 'UFMG', 'Unifenas'] as const
export const PERIODOS = Array.from({ length: 12 }, (_, i) => i + 1)

export const CATEGORIAS: { valor: Categoria; rotulo: string }[] = [
  { valor: 'FISIOTERAPEUTA', rotulo: 'Fisioterapeuta' },
  { valor: 'TERAPEUTA_OCUPACIONAL', rotulo: 'Terapeuta ocupacional' },
  { valor: 'OUTRA', rotulo: 'Outra' },
]

export const UFS: Uf[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

/** Mesma regra do backend (CadastroRequest.TEXTO_SEGURO): sem link e sem símbolo fora de letras, números e . - ' ( ) /. */
const TEXTO_SEGURO = /^(?!.*www\.)[\p{L}\p{N} .'()/-]+$/iu
const MENSAGEM_TEXTO = "Use só letras, números e . - ' ( ) /, sem links"

const FORMATO_REGISTRO: Partial<Record<Categoria, { formato: RegExp; exemplo: string }>> = {
  FISIOTERAPEUTA: { formato: /^\d{1,7}-F$/, exemplo: '123456-F' },
  TERAPEUTA_OCUPACIONAL: { formato: /^\d{1,7}-TO$/, exemplo: '123456-TO' },
}

export function exemploDeRegistro(categoria: string) {
  return FORMATO_REGISTRO[categoria as Categoria]?.exemplo
}

/** Aceita "123456-f" e devolve "123456-F", como a API exige. Categoria "Outra" fica como digitada. */
export function normalizarRegistro(categoria: string, registro: string) {
  const limpo = registro.trim()
  return FORMATO_REGISTRO[categoria as Categoria] ? limpo.toUpperCase() : limpo
}

export const nomeSchema = z
  .string()
  .trim()
  .min(2, 'Informe seu nome completo')
  .max(120, 'Use no máximo 120 caracteres')
  .regex(TEXTO_SEGURO, MENSAGEM_TEXTO)

/** Campos do perfil. Todos texto: o formulário guarda o que foi digitado e a validação decide o que vale. */
export const camposPerfil = {
  perfil: z.enum(['ESTUDANTE', 'PROFISSIONAL'], { error: 'Escolha seu perfil' }).optional(),
  instituicao: z.string(),
  periodo: z.string(),
  categoria: z.string(),
  registro: z.string(),
  uf: z.string(),
}

export type PerfilValores = {
  perfil?: 'ESTUDANTE' | 'PROFISSIONAL'
  instituicao: string
  periodo: string
  categoria: string
  registro: string
  uf: string
}

export const PERFIL_VAZIO: PerfilValores = {
  perfil: undefined,
  instituicao: '',
  periodo: '',
  categoria: '',
  registro: '',
  uf: '',
}

/** Campos exigidos por perfil: estudante (instituição e período) ou profissional (categoria, registro e UF). */
export function validarPerfil(v: PerfilValores, ctx: z.RefinementCtx) {
  const erro = (path: keyof PerfilValores, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })

  if (!v.perfil) erro('perfil', 'Escolha seu perfil')

  if (v.perfil === 'ESTUDANTE') {
    const instituicao = v.instituicao.trim()
    if (!instituicao) erro('instituicao', 'Informe sua instituição de ensino')
    else if (instituicao.length > 120) erro('instituicao', 'Use no máximo 120 caracteres')
    else if (!TEXTO_SEGURO.test(instituicao)) erro('instituicao', MENSAGEM_TEXTO)
    const periodo = Number(v.periodo)
    if (!v.periodo || !Number.isInteger(periodo) || periodo < 1 || periodo > 12) {
      erro('periodo', 'Escolha o período, de 1 a 12')
    }
  }

  if (v.perfil === 'PROFISSIONAL') {
    if (!CATEGORIAS.some((c) => c.valor === v.categoria)) erro('categoria', 'Escolha sua categoria profissional')
    const registro = normalizarRegistro(v.categoria, v.registro)
    const regra = FORMATO_REGISTRO[v.categoria as Categoria]
    if (!registro) erro('registro', 'Informe o número do registro')
    else if (regra && !regra.formato.test(registro)) erro('registro', `Use o formato ${regra.exemplo}`)
    else if (registro.length > 20) erro('registro', 'Use no máximo 20 caracteres')
    else if (!TEXTO_SEGURO.test(registro)) erro('registro', MENSAGEM_TEXTO)
    if (!UFS.includes(v.uf as Uf)) erro('uf', 'Escolha a UF do registro')
  }
}

function validarTermos(v: { termos: boolean }, ctx: z.RefinementCtx) {
  if (!v.termos) {
    ctx.addIssue({ code: 'custom', path: ['termos'], message: 'Aceite os termos de uso e a política de privacidade' })
  }
}

export const cadastroSchema = z
  .object({
    nome: nomeSchema,
    email: emailSchema,
    senha: senhaNovaSchema,
    confirmacao: z.string().min(1, 'Confirme a senha'),
    termos: z.boolean(),
    ...camposPerfil,
  })
  .superRefine((v, ctx) => {
    if (v.senha !== v.confirmacao) {
      ctx.addIssue({ code: 'custom', path: ['confirmacao'], message: 'As senhas não coincidem' })
    }
    validarTermos(v, ctx)
    validarPerfil(v, ctx)
  })

export const completarSchema = z
  .object({ nome: nomeSchema, termos: z.boolean(), ...camposPerfil })
  .superRefine((v, ctx) => {
    validarTermos(v, ctx)
    validarPerfil(v, ctx)
  })

export type CadastroForm = z.input<typeof cadastroSchema>
export type CompletarForm = z.input<typeof completarSchema>

export const CAMPOS_ETAPA_1 = ['nome', 'email', 'senha', 'confirmacao', 'termos'] as const

/** Monta o corpo do POST /usuarios/me. Só vai o que o perfil escolhido usa. */
export function paraCadastroRequest(v: { nome: string; termos: boolean } & PerfilValores): CadastroRequest {
  const nome = v.nome.trim()
  const aceiteTermos = v.termos
  if (v.perfil === 'ESTUDANTE') {
    return {
      nome,
      aceiteTermos,
      perfil: 'ESTUDANTE',
      instituicao: v.instituicao.trim(),
      periodo: Number(v.periodo),
    }
  }
  return {
    nome,
    aceiteTermos,
    perfil: 'PROFISSIONAL',
    categoria: v.categoria as Categoria,
    registro: normalizarRegistro(v.categoria, v.registro),
    uf: v.uf as Uf,
  }
}

/** Volta do corpo da API para os campos do formulário (usado ao completar o cadastro a partir do e-mail). */
export function deCadastroRequest(r: CadastroRequest): { nome: string; termos: boolean } & PerfilValores {
  return {
    nome: r.nome,
    termos: r.aceiteTermos,
    perfil: r.perfil,
    instituicao: r.instituicao ?? '',
    periodo: r.periodo ? String(r.periodo) : '',
    categoria: r.categoria ?? '',
    registro: r.registro ?? '',
    uf: r.uf ?? '',
  }
}

const requestSchema = z.object({
  nome: z.string(),
  aceiteTermos: z.boolean(),
  perfil: z.enum(['ESTUDANTE', 'PROFISSIONAL']),
  instituicao: z.string().optional(),
  periodo: z.number().optional(),
  categoria: z.enum(['FISIOTERAPEUTA', 'TERAPEUTA_OCUPACIONAL', 'OUTRA']).optional(),
  registro: z.string().optional(),
  uf: z.enum(UFS as [Uf, ...Uf[]]).optional(),
})

/**
 * Lê os dados do cadastro guardados no Supabase ao criar a conta (user_metadata.cadastro). O usuário pode
 * alterar esse campo, então ele só serve de pré-preenchimento: quem decide é a validação da API.
 */
export function lerCadastroDoUsuario(metadata: unknown): CadastroRequest | null {
  const bruto = (metadata as { cadastro?: unknown } | null | undefined)?.cadastro
  const lido = requestSchema.safeParse(bruto)
  return lido.success ? lido.data : null
}
