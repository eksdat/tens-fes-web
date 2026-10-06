import {
  cadastroSchema,
  completarSchema,
  deCadastroRequest,
  lerCadastroDoUsuario,
  normalizarRegistro,
  paraCadastroRequest,
  PERFIL_VAZIO,
} from './cadastro'
import { cadastroSeguroSchema } from './cadastroSeguro'

const comuns = { nome: 'Ana Souza', email: 'ana@exemplo.com', senha: 'SenhaForte1!', confirmacao: 'SenhaForte1!', termos: true }
const estudante = { ...PERFIL_VAZIO, perfil: 'ESTUDANTE' as const, instituicao: 'UniBH', periodo: '5' }
const profissional = {
  ...PERFIL_VAZIO,
  perfil: 'PROFISSIONAL' as const,
  categoria: 'FISIOTERAPEUTA',
  registro: '123456-F',
  uf: 'MG',
}

function mensagens(resultado: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  const issues = [...(resultado.error?.issues ?? [])].reverse()
  return Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]))
}

test('deveAceitarCadastroDeEstudanteCompleto', () => {
  expect(cadastroSchema.safeParse({ ...comuns, ...estudante }).success).toBe(true)
})

test('deveAceitarCadastroDeProfissionalCompleto', () => {
  expect(cadastroSchema.safeParse({ ...comuns, ...profissional }).success).toBe(true)
})

test('deveRecusarSenhasDiferentes', () => {
  const r = cadastroSchema.safeParse({ ...comuns, confirmacao: 'Outra1!senha', ...estudante })
  expect(mensagens(r).confirmacao).toBe('As senhas não coincidem')
})

test.each(['Senha@12345', 'Ana@Souza2026'])('deveRecusarSenhaFacilDeAdivinhar %s', (senha) => {
  const r = cadastroSeguroSchema.safeParse({ ...comuns, senha, confirmacao: senha, ...estudante })
  expect(mensagens(r).senha).toMatch(/^Essa senha é fácil de adivinhar\. .+/)
})

test('deveExplicarQueONomeNaoPodeEntrarNaSenhaDoCadastro', () => {
  const r = cadastroSeguroSchema.safeParse({ ...comuns, senha: 'Xk#Souza#91Zq', confirmacao: 'Xk#Souza#91Zq', ...estudante })
  expect(mensagens(r).senha).toBe('Essa senha é fácil de adivinhar. Não use seu nome nem seu e-mail na senha.')
})

test('deveExigirOAceiteDosTermos', () => {
  const r = cadastroSchema.safeParse({ ...comuns, termos: false, ...estudante })
  expect(mensagens(r).termos).toBe('Aceite os termos de uso e a política de privacidade')
})

test('deveExigirPerfil', () => {
  expect(mensagens(cadastroSchema.safeParse({ ...comuns, ...PERFIL_VAZIO })).perfil).toBe('Escolha seu perfil')
})

test('deveRecusarNomeComLink', () => {
  expect(mensagens(cadastroSchema.safeParse({ ...comuns, nome: 'Ganhe www.premio.com', ...estudante })).nome).toMatch(
    /sem links/,
  )
})

test.each([['0'], ['13'], ['2.5'], ['']])('deveRecusarPeriodo %s', (periodo) => {
  const r = cadastroSchema.safeParse({ ...comuns, ...estudante, periodo })
  expect(mensagens(r).periodo).toBe('Escolha o período, de 1 a 12')
})

test('deveExigirAInstituicao', () => {
  const r = cadastroSchema.safeParse({ ...comuns, ...estudante, instituicao: '  ' })
  expect(mensagens(r).instituicao).toBe('Informe sua instituição de ensino')
})

test('deveAceitarInstituicaoDigitadaForaDaLista', () => {
  expect(cadastroSchema.safeParse({ ...comuns, ...estudante, instituicao: 'Faculdade X' }).success).toBe(true)
})

test.each([
  ['FISIOTERAPEUTA', '123456-TO'],
  ['FISIOTERAPEUTA', '123456'],
  ['TERAPEUTA_OCUPACIONAL', '123456-F'],
])('deveRecusarRegistroForaDoFormato %s %s', (categoria, registro) => {
  const r = cadastroSchema.safeParse({ ...comuns, ...profissional, categoria, registro })
  expect(mensagens(r).registro).toMatch(/^Use o formato /)
})

test('deveAceitarRegistroEmMinusculasENormalizar', () => {
  expect(cadastroSchema.safeParse({ ...comuns, ...profissional, registro: '123456-f' }).success).toBe(true)
  expect(normalizarRegistro('FISIOTERAPEUTA', ' 123456-f ')).toBe('123456-F')
})

test('deveAceitarRegistroLivreParaCategoriaOutra', () => {
  expect(cadastroSchema.safeParse({ ...comuns, ...profissional, categoria: 'OUTRA', registro: 'CRM 4567' }).success).toBe(true)
})

test('deveRecusarUfInexistente', () => {
  const r = cadastroSchema.safeParse({ ...comuns, ...profissional, uf: 'XX' })
  expect(mensagens(r).uf).toBe('Escolha a UF do registro')
})

test('deveMontarOCorpoDoEstudanteSemCamposDeProfissional', () => {
  expect(paraCadastroRequest({ termos: true, nome: ' Ana Souza ', ...estudante })).toEqual({
    nome: 'Ana Souza',
    aceiteTermos: true,
    perfil: 'ESTUDANTE',
    instituicao: 'UniBH',
    periodo: 5,
  })
})

test('deveAparEspacosDaInstituicao', () => {
  const corpo = paraCadastroRequest({ termos: true, nome: 'Ana', ...estudante, instituicao: ' Faculdade X ' })
  expect(corpo.instituicao).toBe('Faculdade X')
})

test('deveMontarOCorpoDoProfissionalSemCamposDeEstudante', () => {
  expect(paraCadastroRequest({ termos: true, nome: 'Bia', ...profissional, registro: '123456-f' })).toEqual({
    nome: 'Bia',
    aceiteTermos: true,
    perfil: 'PROFISSIONAL',
    categoria: 'FISIOTERAPEUTA',
    registro: '123456-F',
    uf: 'MG',
  })
})

test('deveVoltarDoCorpoParaOsCamposDoFormulario', () => {
  const campos = deCadastroRequest({ aceiteTermos: true, nome: 'Ana', perfil: 'ESTUDANTE', instituicao: 'Faculdade X', periodo: 3 })
  expect(campos).toMatchObject({ instituicao: 'Faculdade X', periodo: '3' })
})

test('deveLerOsDadosGuardadosNaConta', () => {
  const guardado = { aceiteTermos: true, nome: 'Ana', perfil: 'ESTUDANTE', instituicao: 'UniBH', periodo: 5 }
  expect(lerCadastroDoUsuario({ cadastro: guardado })).toEqual(guardado)
})

test.each([[undefined], [null], [{}], [{ cadastro: { perfil: 'ADMIN', nome: 'x' } }], [{ cadastro: 'texto' }]])(
  'deveIgnorarDadosGuardadosInvalidos %j',
  (metadata) => {
    expect(lerCadastroDoUsuario(metadata)).toBeNull()
  },
)

test('deveValidarOCompletarCadastroComNomeEPerfil', () => {
  expect(completarSchema.safeParse({ nome: 'Ana Souza', termos: true, ...estudante }).success).toBe(true)
  expect(mensagens(completarSchema.safeParse({ nome: '', termos: true, ...estudante })).nome).toBe('Informe seu nome completo')
})
