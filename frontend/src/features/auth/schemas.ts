import { z } from 'zod'

export const emailSchema = z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('Informe um e-mail válido'))

export const senhaNovaSchema = z
  .string()
  .min(1, 'Informe a senha')
  .min(10, 'A senha precisa ter ao menos 10 caracteres')
  .regex(/[a-z]/, 'Inclua uma letra minúscula')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula')
  .regex(/\d/, 'Inclua um número')
  .regex(/[^A-Za-z0-9]/, 'Inclua um símbolo, como ! ou #')
