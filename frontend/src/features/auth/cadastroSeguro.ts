import { cadastroSchema } from './cadastro'
import { dadosPessoais, MENSAGEM_SENHA_FACIL, senhaFacilDeAdivinhar } from './forcaSenha'
import { senhaNovaSchema } from './schemas'

// Separado de cadastro.ts: este módulo carrega o zxcvbn-ts (~1 MB) e só a tela de cadastro precisa dele.
export const cadastroSeguroSchema = cadastroSchema.superRefine((v, ctx) => {
  if (senhaNovaSchema.safeParse(v.senha).success && senhaFacilDeAdivinhar(v.senha, dadosPessoais(v.nome, v.email))) {
    ctx.addIssue({ code: 'custom', path: ['senha'], message: MENSAGEM_SENHA_FACIL })
  }
})
