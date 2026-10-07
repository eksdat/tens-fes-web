import { emailSchema, senhaNovaSchema } from '@/features/auth/schemas'

function mensagem(resultado: { success: boolean; error?: { issues: { message: string }[] } }) {
  return resultado.success ? null : resultado.error?.issues[0]?.message
}

test('deveExigirEmail', () => {
  expect(mensagem(emailSchema.safeParse('   '))).toBe('Informe seu e-mail')
})

test('deveRecusarEmailMalFormado', () => {
  expect(mensagem(emailSchema.safeParse('ana@'))).toBe('Informe um e-mail válido')
})

test('deveAceitarEmailValidoComEspacosNasPontas', () => {
  expect(emailSchema.safeParse('  ana@exemplo.com ').success).toBe(true)
})

test.each([
  ['Curta1!', 'A senha precisa ter ao menos 10 caracteres'],
  ['SENHAFORTE1!', 'Inclua uma letra minúscula'],
  ['senhafraca1!', 'Inclua uma letra maiúscula'],
  ['SenhaForte!!', 'Inclua um número'],
  ['SenhaForte12', 'Inclua um símbolo, como ! ou #'],
])('deveRecusarSenha %s', (senha, esperado) => {
  expect(mensagem(senhaNovaSchema.safeParse(senha))).toBe(esperado)
})

test('deveAceitarSenhaQueSegueAPolitica', () => {
  expect(senhaNovaSchema.safeParse('SenhaForte1!').success).toBe(true)
})
