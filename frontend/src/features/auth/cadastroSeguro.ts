import { cadastroSchema } from './cadastro'
import { dadosPessoais, mensagemSenhaFraca } from './forcaSenha'
import { senhaNovaSchema } from './schemas'

// Separado de cadastro.ts: este módulo carrega o zxcvbn-ts (~1 MB) e só a tela de cadastro precisa dele.
export const cadastroSeguroSchema = cadastroSchema.superRefine((v, ctx) => {
  if (!senhaNovaSchema.safeParse(v.senha).success) return
  const message = mensagemSenhaFraca(v.senha, dadosPessoais(v.nome, v.email))
  if (message) ctx.addIssue({ code: 'custom', path: ['senha'], message })
})
