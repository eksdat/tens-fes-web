import { dadosPessoais, EXEMPLOS_SENHA_FORTE, motivoSenhaFraca, senhaFacilDeAdivinhar } from './forcaSenha'
import { senhaNovaSchema } from '../schemas'

test.each(['Senha@12345', 'Qwerty@12345', 'Aaaaaaaa@1', 'Fisioterapia1!', 'Brasil@2024'])(
  'deveRecusarSenhaPrevisivel %s',
  (senha) => {
    expect(senhaFacilDeAdivinhar(senha, [])).toBe(true)
  },
)

test('deveRecusarSenhaComNomeDaPessoa', () => {
  expect(senhaFacilDeAdivinhar('Joaquim@Tavares7', dadosPessoais('Joaquim Tavares', 'jq@exemplo.com'))).toBe(true)
})

test('deveRecusarSenhaComParteLocalDoEmail', () => {
  expect(senhaFacilDeAdivinhar('Xk#anaclara#91Z', dadosPessoais('', 'anaclara@exemplo.com'))).toBe(true)
})

test('deveRecusarNomeComAcentoEMaiusculaDiferente', () => {
  expect(senhaFacilDeAdivinhar('xK#JOÃO#91zQ', dadosPessoais('João Silva', 'a@exemplo.com'))).toBe(true)
})

test('deveAceitarSenhaAleatoria', () => {
  expect(senhaFacilDeAdivinhar('vR7#kQ2!mZp9', dadosPessoais('Ana Souza', 'ana@exemplo.com'))).toBe(false)
})

test('deveIgnorarPalavrasCurtasDoNome', () => {
  expect(dadosPessoais('Ana de Souza', 'ana.souza@exemplo.com')).toEqual(['Ana', 'Souza', 'ana.souza', 'ana', 'souza'])
})

test('deveExplicarQueONomeNaoPodeEntrarNaSenha', () => {
  expect(motivoSenhaFraca('Joaquim@Tavares7', dadosPessoais('Joaquim Tavares', 'jq@exemplo.com'))).toBe(
    'Não use seu nome nem seu e-mail na senha.',
  )
})

test('deveDarMotivoParaSenhaPrevisivel', () => {
  const motivo = motivoSenhaFraca('Senha@12345', [])
  expect(motivo).toEqual(expect.any(String))
  expect(motivo).not.toMatch(/nome/)
})

test('naoDeveDarMotivoParaSenhaForte', () => {
  expect(motivoSenhaFraca('vR7#kQ2!mZp9', [])).toBeNull()
})

test.each(EXEMPLOS_SENHA_FORTE)('exemploDeSenhaDeveSerAceito %s', (exemplo) => {
  expect(senhaNovaSchema.safeParse(exemplo).success).toBe(true)
  expect(senhaFacilDeAdivinhar(exemplo, [])).toBe(false)
})
