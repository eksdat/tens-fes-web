import { dadosPessoais, senhaFacilDeAdivinhar } from './forcaSenha'

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
