import {
  limparIdentificador,
  limparNome,
  mascararTelefone,
  pareceDocumento,
  telefoneValido,
} from '@/features/pacientes/formatar'

describe('máscara de telefone', () => {
  test.each([
    ['3', '(3'],
    ['31', '(31'],
    ['319', '(31) 9'],
    ['3199999', '(31) 9999-9'],
    ['3133334444', '(31) 3333-4444'],
    ['31999990000', '(31) 99999-0000'],
    ['(31) 99999-0000', '(31) 99999-0000'],
  ])('deveFormatar %s como %s', (digitado, esperado) => {
    expect(mascararTelefone(digitado)).toBe(esperado)
  })

  test('deveIgnorarLetrasEDigitosAlemDeOnze', () => {
    expect(mascararTelefone('31a99999b0000123')).toBe('(31) 99999-0000')
  })
})

describe('validação de telefone', () => {
  test.each([
    ['(31) 99999-0000', true],
    ['(31) 3333-4444', true],
    ['(31) 9999-000', false],
    ['(01) 99999-0000', false],
    ['(31) 09999-0000', false],
  ])('deveValidar %s como %s', (telefone, valido) => {
    expect(telefoneValido(telefone)).toBe(valido)
  })
})

describe('identificador', () => {
  test('deveDeixarSoLetrasDigitosEHifenEmMaiuscula', () => {
    expect(limparIdentificador('caso 01/ã#')).toBe('CASO01')
    expect(limparIdentificador('caso-01_a.b')).toBe('CASO-01_A.B')
  })

  test('deveReconhecerNumeroComCaraDeDocumento', () => {
    expect(pareceDocumento('12345678901')).toBe(true)
    expect(pareceDocumento('123.456.789-01')).toBe(true)
    expect(pareceDocumento('CASO-01')).toBe(false)
  })
})

describe('nome', () => {
  test('deveTirarDigitosESimbolosEManterAcentoApostrofoEHifen', () => {
    expect(limparNome('Jo4ão D’Ávila-Silva!')).toBe('João D’Ávila-Silva')
  })
})
